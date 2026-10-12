// Gemini proxy for the VPS.
//
// The browser never sees the Gemini API key. It calls this server with its
// Firebase ID token; the server asks Firestore (with that same token) whether
// the user is approved, then forwards the request to Gemini with the real key.
//
// Zero dependencies. Requires Node 20+.
//
// Environment:
//   GEMINI_API_KEY         (required) Gemini API key, never sent to the browser
//   FIREBASE_PROJECT_ID    (default: projectId from firebase-applet-config.json)
//   FIRESTORE_DATABASE_ID  (default: firestoreDatabaseId from firebase-applet-config.json)
//   HOST / PORT            (default: 127.0.0.1 / 8787)
//   RATE_LIMIT_PER_MINUTE  (default: 20) requests per user per minute
//   FIRESTORE_BASE_URL / GEMINI_BASE_URL  (only for tests)

import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { Readable } from 'node:stream';

const firebaseConfig = JSON.parse(
  fs.readFileSync(new URL('../firebase-applet-config.json', import.meta.url), 'utf8'),
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '(default)';
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 8787);
const RATE_LIMIT_PER_MINUTE = Number(process.env.RATE_LIMIT_PER_MINUTE || 20);
const FIRESTORE_BASE_URL = process.env.FIRESTORE_BASE_URL || 'https://firestore.googleapis.com';
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';

// Only the models the app actually uses. Anything else is rejected.
const ALLOWED_MODELS = new Set([
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview',
  'gemini-2.5-flash-preview-tts',
]);
const ALLOWED_METHODS = new Set(['generateContent', 'streamGenerateContent']);
const ROUTE = /^\/api\/gemini\/v1beta\/models\/([a-z0-9.-]+):([A-Za-z]+)$/;

const MAX_BODY_BYTES = 15 * 1024 * 1024; // enough for a dictated audio clip
const UPSTREAM_TIMEOUT_MS = 5 * 60 * 1000;
const APPROVAL_CACHE_MS = 5 * 60 * 1000;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set. Refusing to start.');
  process.exit(1);
}

// ---------------------------------------------------------------
// Auth: approval is decided by the Firestore rules (accessCheck/{uid})
// ---------------------------------------------------------------

const approvalCache = new Map(); // sha256(token) -> { uid, expiresAt }

function readTokenClaims(token) {
  // Not a signature check: Firestore verifies the token when we call it.
  // We only read the claims to build the accessCheck path and cache expiry.
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    const uid = claims.user_id || claims.sub;
    if (typeof uid !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(uid)) return null;
    return { uid, exp: Number(claims.exp) || 0 };
  } catch {
    return null;
  }
}

async function checkApproval(token) {
  const key = crypto.createHash('sha256').update(token).digest('hex');
  const cached = approvalCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return { ok: true, uid: cached.uid };

  const claims = readTokenClaims(token);
  if (!claims) return { ok: false, status: 401 };

  const url = `${FIRESTORE_BASE_URL}/v1/projects/${encodeURIComponent(PROJECT_ID)}` +
    `/databases/${encodeURIComponent(DATABASE_ID)}/documents/accessCheck/${claims.uid}`;
  let res;
  try {
    res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10_000) });
  } catch {
    return { ok: false, status: 502 };
  }

  // 200/404 = the rules allowed the read (the doc does not need to exist).
  if (res.status === 200 || res.status === 404) {
    const tokenExpiry = claims.exp ? claims.exp * 1000 : Date.now() + APPROVAL_CACHE_MS;
    approvalCache.set(key, { uid: claims.uid, expiresAt: Math.min(Date.now() + APPROVAL_CACHE_MS, tokenExpiry) });
    return { ok: true, uid: claims.uid };
  }
  if (res.status === 401 || res.status === 403) return { ok: false, status: 403 };
  return { ok: false, status: 502 };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of approvalCache) if (entry.expiresAt <= now) approvalCache.delete(key);
}, 60_000).unref();

// ---------------------------------------------------------------
// Rate limit: fixed window per user
// ---------------------------------------------------------------

const rateWindows = new Map(); // uid -> { windowStart, count }

function isRateLimited(uid) {
  const now = Date.now();
  const entry = rateWindows.get(uid);
  if (!entry || now - entry.windowStart >= 60_000) {
    rateWindows.set(uid, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_PER_MINUTE;
}

setInterval(() => {
  const now = Date.now();
  for (const [uid, entry] of rateWindows) if (now - entry.windowStart >= 60_000) rateWindows.delete(uid);
}, 60_000).unref();

// ---------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------

function sendError(res, status, message) {
  if (res.headersSent) return res.destroy();
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ error: { code: status, message } }));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers['content-length'] || 0);
    if (declared > MAX_BODY_BYTES) return reject(Object.assign(new Error('too large'), { status: 413 }));
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/api/gemini/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('ok');
  }

  const match = ROUTE.exec(url.pathname);
  if (!match) return sendError(res, 404, 'Not found');
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');

  const [, model, method] = match;
  if (!ALLOWED_MODELS.has(model) || !ALLOWED_METHODS.has(method)) {
    return sendError(res, 403, 'Model or method not allowed');
  }

  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return sendError(res, 401, 'Missing token');
  const approval = await checkApproval(auth.slice('Bearer '.length).trim());
  if (!approval.ok) {
    const messages = { 401: 'Invalid token', 403: 'Account not approved', 502: 'Could not verify access' };
    return sendError(res, approval.status, messages[approval.status]);
  }
  if (isRateLimited(approval.uid)) return sendError(res, 429, 'Too many requests, wait a minute');

  let body;
  try {
    body = await readBody(req);
    JSON.parse(body.toString('utf8'));
  } catch (error) {
    return sendError(res, error.status || 400, error.status === 413 ? 'Request too large' : 'Invalid JSON body');
  }

  const upstreamUrl = new URL(`${GEMINI_BASE_URL}/v1beta/models/${model}:${method}`);
  if (method === 'streamGenerateContent') upstreamUrl.searchParams.set('alt', 'sse');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  res.on('close', () => {
    clearTimeout(timeout);
    controller.abort();
  });

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body,
      signal: controller.signal,
    });
    res.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
      'Cache-Control': 'no-store',
    });
    if (!upstream.body) return res.end();
    Readable.fromWeb(upstream.body).on('error', () => res.destroy()).pipe(res);
  } catch {
    sendError(res, 502, 'Gemini request failed');
  }
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(() => sendError(res, 500, 'Internal error'));
});
server.requestTimeout = UPSTREAM_TIMEOUT_MS + 30_000;
server.listen(PORT, HOST, () => {
  console.log(`Gemini proxy listening on http://${HOST}:${PORT} (project ${PROJECT_ID}, database ${DATABASE_ID})`);
});
