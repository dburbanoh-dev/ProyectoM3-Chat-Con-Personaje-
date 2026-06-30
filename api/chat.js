/**
 * /api/chat
 *
 * Función serverless de Vercel que actúa como proxy seguro entre el
 * frontend y la API de Gemini (Google AI).
 *
 * Por qué existe esta función y no se llama a la API directamente
 * desde el navegador:
 *  - La API key es secreta. Si se usara desde el frontend, cualquier
 *    persona podría abrir las DevTools y robarla (y gastar nuestra cuota,
 *    o usarla para fines maliciosos).
 *  - Aquí la key vive solo como variable de entorno del servidor
 *    (GEMINI_API_KEY), nunca llega al navegador del usuario.
 *  - Además, este es un buen lugar para validar la entrada, controlar
 *    el system prompt del personaje y, en una versión futura, aplicar
 *    rate limiting por IP/usuario.
 */

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `Eres Yoda, el maestro Jedi de Star Wars.
Reglas de personaje:
- Hablas siempre con la sintaxis invertida característica de Yoda (objeto-sujeto-verbo), en español.
- Eres sabio, paciente, algo enigmático, y ocasionalmente usas humor sutil.
- Hablas de la Fuerza, el equilibrio, la paciencia y el autoconocimiento cuando sea relevante, sin forzarlo en cada respuesta.
- Mantienes las respuestas breves (1 a 4 frases), como en una conversación real, no como un ensayo.
- Nunca rompes el personaje ni mencionas que eres un modelo de lenguaje o una IA.
- Si te preguntan algo fuera de tu conocimiento como personaje (por ejemplo, eventos actuales reales), respondes con evasivas propias de Yoda, sin inventar datos como si fueran verídicos.`;

const MAX_MESSAGES = 20; // límite simple para no dejar crecer el contexto sin control
const MAX_MESSAGE_LENGTH = 1000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Falta la variable de entorno GEMINI_API_KEY');
    return res.status(500).json({ error: 'El servidor no está configurado correctamente.' });
  }

  const { messages } = req.body || {};

  const validationError = validateMessages(messages);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: toGeminiContents(messages),
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 300
        }
      })
    });

    if (geminiResponse.status === 429) {
      return res.status(429).json({ error: 'Demasiadas peticiones. Inténtalo de nuevo en unos segundos.' });
    }

    if (!geminiResponse.ok) {
      const errBody = await safeJson(geminiResponse);
      console.error('Error de Gemini API:', geminiResponse.status, errBody);
      return res.status(502).json({ error: 'Yoda no pudo responder en este momento.' });
    }

    const data = await geminiResponse.json();
    const reply = extractTextFromGeminiResponse(data);

    if (!reply) {
      return res.status(502).json({ error: 'La respuesta del modelo llegó vacía.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Error inesperado llamando a Gemini:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

/**
 * Valida la forma del body recibido del cliente.
 * @returns {string|null} mensaje de error, o null si es válido
 */
function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'Se requiere un arreglo "messages" no vacío.';
  }
  if (messages.length > MAX_MESSAGES) {
    return `Conversación demasiado larga (máximo ${MAX_MESSAGES} mensajes).`;
  }
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) {
      return 'Cada mensaje debe tener role "user" o "assistant".';
    }
    if (typeof m.content !== 'string' || m.content.trim() === '') {
      return 'Cada mensaje debe tener "content" como texto no vacío.';
    }
    if (m.content.length > MAX_MESSAGE_LENGTH) {
      return `Cada mensaje debe tener menos de ${MAX_MESSAGE_LENGTH} caracteres.`;
    }
  }
  return null;
}

/**
 * Convierte el historial { role: 'user'|'assistant', content } al formato
 * que espera Gemini: { role: 'user'|'model', parts: [{ text }] }.
 * Gemini usa "model" donde nosotros usamos "assistant".
 */
function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));
}

/**
 * Extrae el texto de la respuesta de la API de Gemini.
 * Forma esperada:
 * { candidates: [ { content: { parts: [ { text: '...' } ] } } ] }
 */
function extractTextFromGeminiResponse(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  const textPart = parts.find((p) => typeof p.text === 'string');
  return textPart ? textPart.text.trim() : '';
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
