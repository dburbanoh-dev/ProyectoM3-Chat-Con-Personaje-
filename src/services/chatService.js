import { extractReplyText, toApiMessages } from '../utils/parse.js';

/**
 * Envía el historial de la conversación a nuestra función serverless
 * (/api/chat), que actúa como proxy seguro hacia la API de IA.
 * Nunca se llama directamente a la API de IA desde el frontend:
 * la API key vive solo en el servidor (variable de entorno).
 *
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 * @returns {Promise<string>} el texto de respuesta del personaje
 */
export async function sendMessage(messages) {
  let response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: toApiMessages(messages) })
    });
  } catch (networkError) {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión a internet.');
  }

  if (response.status === 429) {
    throw new Error('Demasiadas peticiones seguidas. Espera unos segundos e inténtalo de nuevo.');
  }

  if (!response.ok) {
    let serverMessage = '';
    try {
      const errorBody = await response.json();
      serverMessage = errorBody?.error || '';
    } catch {
      // el cuerpo no era JSON, ignoramos
    }
    throw new Error(serverMessage || `Error del servidor (${response.status}).`);
  }

  const data = await response.json();
  return extractReplyText(data);
}
