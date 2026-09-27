import { GoogleGenAI } from '@google/genai';
import { auth } from './firebase';

// Gemini client that talks to our own server (server/gemini-proxy.mjs) instead of Google.
// The server holds the real API key; the browser only sends the user's Firebase ID token.
export async function getAI(): Promise<GoogleGenAI> {
  const user = auth.currentUser;
  if (!user) throw new Error('Inicia sesión para usar la IA.');
  const idToken = await user.getIdToken();
  return new GoogleGenAI({
    // Placeholder: the SDK requires a value, the proxy ignores it and uses its own key.
    apiKey: 'proxy',
    httpOptions: {
      baseUrl: `${window.location.origin}/api/gemini/`,
      headers: { Authorization: `Bearer ${idToken}` },
    },
  });
}
