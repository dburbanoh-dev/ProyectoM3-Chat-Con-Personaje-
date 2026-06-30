/**
 * Funciones de transformación/parseo, separadas a propósito de:
 *  - el fetching (services/chatService.js)
 *  - el renderizado (views/chat.js)
 *
 * Así cada pieza se puede testear de forma aislada con Vitest.
 */

/**
 * Extrae el texto de respuesta del personaje a partir del JSON
 * que devuelve nuestra función serverless (/api/chat).
 *
 * Forma esperada de la respuesta:
 * { reply: "texto del personaje" }
 *
 * @param {unknown} data
 * @returns {string}
 * @throws {Error} si la forma del JSON no es la esperada
 */
export function extractReplyText(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Respuesta inválida del servidor: se esperaba un objeto JSON.');
  }
  if (typeof data.reply !== 'string' || data.reply.trim() === '') {
    throw new Error('Respuesta inválida del servidor: falta el campo "reply".');
  }
  return data.reply.trim();
}

/**
 * Convierte el historial de mensajes del estado de la app al formato
 * { role, content } que espera la API de mensajes (roles "user"/"assistant").
 * @param {Array<{role: string, content: string}>} messages
 */
export function toApiMessages(messages) {
  return messages.map(({ role, content }) => ({ role, content }));
}

/**
 * Recorta espacios y descarta mensajes vacíos antes de enviarlos.
 * @param {string} text
 */
export function sanitizeUserInput(text) {
  return (text || '').trim();
}
