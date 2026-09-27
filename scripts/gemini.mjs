#!/usr/bin/env node
/**
 * Delega una consulta a Gemini usando la clave que el proyecto ya tiene.
 *
 * Es de SOLO LECTURA por construcción: lee archivos y escribe la respuesta por
 * stdout. No tiene ninguna ruta de código que modifique, cree o borre archivos.
 *
 * Uso:
 *   node scripts/gemini.mjs "pregunta"
 *   node scripts/gemini.mjs --file src/App.tsx "¿qué hace este componente?"
 *   node scripts/gemini.mjs --file src/components "resume qué hace cada archivo"
 *   node scripts/gemini.mjs --model <id> "pregunta"
 *   node scripts/gemini.mjs --list-models
 */

import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = 'gemini-3-flash-preview';

/** Tope de entrada. Protege la cuota gratuita y evita peticiones enormes. */
const MAX_TOTAL_BYTES = 400_000;
const MAX_FILE_BYTES = 200_000;

/** Extensiones que se consideran texto al recorrer un directorio. */
const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.md', '.txt', '.css', '.html', '.yml', '.yaml', '.rules',
]);

/** Carpetas que nunca se recorren. */
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next']);

/**
 * Archivos que se niegan aunque se pidan por nombre.
 *
 * Esto es la barrera de seguridad principal: enviar un archivo a Gemini es
 * enviarlo a un servidor de Google. Un secreto que sale de aquí hay que
 * considerarlo comprometido y rotarlo, así que es mejor negarse a mandarlo.
 */
const SECRET_PATTERNS = [
  /(^|\/)\.env($|\.)/i,            // .env, .env.local, .env.production
  /(^|\/)\.npmrc$/i,
  /(^|\/)id_(rsa|ed25519)/i,
  /\.(pem|key|p12|pfx|keystore)$/i,
  /service[-_]?account/i,
  /credential/i,
  /secret/i,
  /firebase.*config.*\.json$/i,    // firebase-applet-config.json y similares
];

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function isSecretPath(filePath) {
  const normalised = filePath.split(path.sep).join('/');
  return SECRET_PATTERNS.some((pattern) => pattern.test(normalised));
}

/**
 * Busca la clave en el entorno y, si no está, en .env.local.
 * Nunca imprime su valor.
 */
function resolveApiKey(projectRoot) {
  const fromEnv = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (fromEnv) return fromEnv.trim();

  const envFile = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envFile)) return null;

  for (const rawLine of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const name = line.slice(0, separator).trim();
    if (name !== 'GEMINI_API_KEY' && name !== 'GOOGLE_API_KEY') continue;

    // Quita comillas envolventes si las hay.
    return line.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

/** Recorre un directorio y devuelve las rutas de sus archivos de texto. */
function walkDirectory(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
        found.push(...walkDirectory(full));
      }
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      found.push(full);
    }
  }
  return found;
}

/** Convierte las rutas pedidas en una lista concreta de archivos a leer. */
function expandPaths(requested) {
  const files = [];
  for (const target of requested) {
    if (!fs.existsSync(target)) fail(`No existe la ruta: ${target}`);
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      const inside = walkDirectory(target);
      if (inside.length === 0) fail(`No hay archivos de texto en: ${target}`);
      files.push(...inside);
    } else {
      files.push(target);
    }
  }
  return [...new Set(files)];
}

/** Lee los archivos aplicando el filtro de secretos y los topes de tamaño. */
function readAttachments(files) {
  const blocked = files.filter(isSecretPath);
  if (blocked.length > 0) {
    fail(
      `Me niego a enviar archivos que pueden contener secretos:\n` +
      blocked.map((f) => `    ${f}`).join('\n') +
      `\n\n  Enviar un archivo a Gemini es enviarlo a un servidor de Google.\n` +
      `  Si de verdad necesitas consultar algo de ahí, pega solo el fragmento\n` +
      `  relevante en la pregunta, sin claves.`
    );
  }

  const attachments = [];
  let totalBytes = 0;

  for (const file of files) {
    const bytes = fs.statSync(file).size;
    if (bytes > MAX_FILE_BYTES) {
      fail(`${file} pesa ${Math.round(bytes / 1024)} KB, por encima del tope de ${Math.round(MAX_FILE_BYTES / 1024)} KB.`);
    }

    totalBytes += bytes;
    if (totalBytes > MAX_TOTAL_BYTES) {
      fail(
        `El total supera el tope de ${Math.round(MAX_TOTAL_BYTES / 1024)} KB (llevas ${Math.round(totalBytes / 1024)} KB).\n` +
        `  Pasa menos archivos o acota el directorio.`
      );
    }

    attachments.push({ file, content: fs.readFileSync(file, 'utf8') });
  }

  return { attachments, totalBytes };
}

function parseArgs(argv) {
  const options = { model: DEFAULT_MODEL, files: [], listModels: false, promptParts: [] };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--list-models') {
      options.listModels = true;
    } else if (arg === '--model') {
      const value = argv[i + 1];
      if (!value) fail('--model necesita un identificador. Prueba --list-models para ver los disponibles.');
      options.model = value;
      i += 1;
    } else if (arg === '--file') {
      const value = argv[i + 1];
      if (!value) fail('--file necesita una ruta.');
      options.files.push(value);
      i += 1;
    } else {
      options.promptParts.push(arg);
    }
  }

  return options;
}

async function listModels(ai) {
  const usable = [];
  for await (const model of await ai.models.list()) {
    const actions = model.supportedActions;
    // Un modelo sin supportedActions declarados se muestra igualmente:
    // la lista es orientativa, no un filtro estricto.
    if (!actions || actions.includes('generateContent')) {
      usable.push(model.name?.replace(/^models\//, '') ?? '(sin nombre)');
    }
  }

  if (usable.length === 0) {
    fail('La API no devolvió ningún modelo. Revisa que la clave sea válida.');
  }

  console.log('\nModelos disponibles para tu clave:\n');
  for (const name of usable.sort()) console.log(`  ${name}`);
  console.log(`\nPor defecto se usa: ${DEFAULT_MODEL}`);
  console.log('Cámbialo con --model <id>.\n');
}

async function main() {
  const projectRoot = process.cwd();
  const options = parseArgs(process.argv.slice(2));

  const apiKey = resolveApiKey(projectRoot);
  if (!apiKey) {
    fail(
      'No encuentro GEMINI_API_KEY.\n\n' +
      '  Ponla en .env.local, en la raíz del proyecto:\n' +
      '      GEMINI_API_KEY=tu-clave\n\n' +
      '  La clave se saca gratis en https://aistudio.google.com/apikey\n' +
      '  .env.local ya está en .gitignore, así que no se sube al repositorio.'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  if (options.listModels) {
    await listModels(ai);
    return;
  }

  const question = options.promptParts.join(' ').trim();
  if (!question) {
    fail('Falta la pregunta.\n\n  Ejemplo:\n      node scripts/gemini.mjs --file src/App.tsx "¿qué hace este archivo?"');
  }

  const { attachments, totalBytes } = readAttachments(expandPaths(options.files));

  let prompt = question;
  if (attachments.length > 0) {
    const body = attachments
      .map(({ file, content }) => `--- ${file} ---\n${content}`)
      .join('\n\n');
    prompt =
      `Estos son archivos de un proyecto. Respóndeme en castellano, de forma concreta ` +
      `y citando el archivo y la línea cuando venga al caso.\n\n` +
      `PREGUNTA: ${question}\n\n${body}`;

    console.error(
      `→ Gemini (${options.model}): ${attachments.length} archivo(s), ` +
      `${Math.round(totalBytes / 1024)} KB\n`
    );
  } else {
    console.error(`→ Gemini (${options.model})\n`);
  }

  let response;
  try {
    response = await ai.models.generateContent({ model: options.model, contents: prompt });
  } catch (error) {
    const message = String(error?.message ?? error);
    if (/API[_ ]?key|API_KEY_INVALID|UNAUTHENTICATED|permission/i.test(message)) {
      fail(`La clave no es válida o no tiene permiso.\n\n  Detalle: ${message}`);
    }
    if (/quota|RESOURCE_EXHAUSTED|rate/i.test(message)) {
      fail(
        `Has agotado la cuota de este modelo.\n\n  Detalle: ${message}\n\n` +
        `  Los modelos "flash-lite" suelen tener el límite gratuito más alto.\n` +
        `  Mira los disponibles con --list-models y prueba otro con --model.`
      );
    }
    if (/not found|NOT_FOUND|is not supported/i.test(message)) {
      fail(`El modelo "${options.model}" no existe o no sirve para esto.\n\n  Usa --list-models para ver los válidos.`);
    }
    fail(`Fallo al llamar a Gemini.\n\n  Detalle: ${message}`);
  }

  const text = response.text;
  if (!text) {
    fail('Gemini respondió vacío. Puede ser un filtro de seguridad o una pregunta demasiado ambigua.');
  }

  console.log(text);
}

main().catch((error) => fail(String(error?.stack ?? error)));
