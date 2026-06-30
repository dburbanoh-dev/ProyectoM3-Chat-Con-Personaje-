# Chat con Yoda 🟢

POC de ComicSansCon: una Single Page Application donde puedes chatear con
**Yoda** (Star Wars), usando IA real (API de Gemini, de Google) integrada
de forma segura mediante una Vercel Serverless Function.

> Proyecto educativo / demo interna, sin fines comerciales. No está
> afiliado, respaldado ni patrocinado por Lucasfilm ni Disney.

---

## 1. El personaje elegido

**Yoda**, maestro Jedi de *Star Wars*. Se eligió por ser un personaje muy
reconocible, con un estilo de habla distintivo (sintaxis invertida) que
permite probar fácilmente si el "system prompt" logra mantener una
personalidad consistente a lo largo de la conversación.

El comportamiento del personaje se define en el `system prompt` dentro de
[`api/chat.js`](./api/chat.js): tono sabio y paciente, sintaxis invertida,
respuestas breves, y nunca rompe el personaje (no admite ser una IA).

---

## 2. Arquitectura (resumen)

chat-con-yoda/
├─ api/
│  └─ chat.js          # Vercel Serverless Function: proxy seguro hacia Gemini
├─ src/
│  ├─ main.js           # Bootstrap: registra rutas e inicia el router
│  ├─ router.js         # Router basado en History API (sin librerías)
│  ├─ state.js           # Estado en memoria del chat
│  ├─ views/
│  │  ├─ home.js         # Vista "/"
│  │  ├─ chat.js          # Vista "/chat" (UI de conversación)
│  │  └─ about.js          # Vista "/about"
│  ├─ services/
│  │  └─ chatService.js  # fetch hacia /api/chat (manejo de errores/estados)
│  ├─ utils/
│  │  └─ parse.js         # Funciones puras de transformación/parseo (testeables)
│  └─ styles/
│     └─ main.css         # Mobile-first, Flexbox/Grid, media queries
├─ tests/                  # Tests unitarios con Vitest (fetch mockeado)
├─ public/
│  └─ yoda-avatar.svg
├─ .env.example
├─ vercel.json
├─ vite.config.js
└─ package.json

**Flujo de una pregunta del usuario:**

1. El usuario escribe en `/chat` → `views/chat.js` captura el submit.
2. `services/chatService.js` hace `fetch('/api/chat', { method: 'POST', ... })`
   con el historial de mensajes (transformado por `utils/parse.js`).
3. La función serverless `api/chat.js` recibe la petición, agrega el
   `system prompt` de Yoda (como `systemInstruction`), y llama a la API de
   Gemini usando la `GEMINI_API_KEY` (solo disponible en el servidor).
4. La respuesta se devuelve al frontend como `{ reply: "..." }`.
5. `utils/parse.js` valida/extrae el texto y la vista lo pinta en pantalla.

La clave de API **nunca** se incluye en el bundle del frontend: solo vive
como variable de entorno del lado del servidor (Vercel).

---

## 3. Requisitos

Node.js 18 o superior

Una cuenta de Vercel (gratuita) y la CLI de Vercel (`npm i -g vercel`)

Una API key de Gemini (Google AI Studio): https://aistudio.google.com/apikey

## 4. Ejecutar en local

### 4.1 Instalar dependencias

```bash
npm install
```

### 4.2 Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y coloca tu clave real:

GEMINI_API_KEY=tu-clave-real-de-gemini

> `.env` está en `.gitignore`: nunca se sube al repositorio.

### 4.3 Levantar el proyecto con las funciones serverless

Para que `/api/chat` funcione localmente (no solo el frontend), usa la CLI
de Vercel, que simula el entorno de producción incluyendo las funciones:

```bash
vercel dev
```

La primera vez te pedirá vincular el proyecto a tu cuenta de Vercel
(puedes elegir "no" a crear un proyecto remoto si solo quieres probar
local). Esto levantará la app en algo como `http://localhost:3000`.

Alternativamente, para iterar rápido solo en el frontend (sin IA real),
puedes usar:

```bash
npm run dev
```

(esto levanta Vite en `http://localhost:5173`, pero `/api/chat` no
responderá a menos que tengas otro proceso sirviendo esa ruta).

---

## 5. Tests

El proyecto usa **Vitest** con `fetch` mockeado (sin red real) para probar:

- `tests/parse.test.js` — funciones de transformación/parseo de la respuesta
- `tests/chatService.test.js` — el servicio de fetching (éxito, error genérico,
  rate limiting, error de red)
- `tests/router.test.js` — el router (coincidencia de rutas y navegación)

Ejecutar la suite completa:

```bash
npm test
```

Modo watch mientras desarrollas:

```bash
npm run test:watch
```

---

## 6. Desplegar a Vercel

### Opción A: desde la web

1. Sube este repositorio a GitHub.
2. En https://vercel.com → **Add New... → Project** → importa el repo.
3. En **Environment Variables**, agrega `GEMINI_API_KEY` con tu clave real.
4. Vercel detecta automáticamente el `buildCommand` (`npm run build`) y el
   `outputDirectory` (`dist`) definidos en `vercel.json`. Despliega.
5. Verifica la URL pública que te entrega Vercel y prueba el chat en
   producción.

### Opción B: desde la CLI

```bash
vercel login
vercel link
vercel env add GEMINI_API_KEY   # pégala cuando te la pida (entorno: Production)
vercel --prod
```

Al finalizar, la CLI imprime la URL pública del despliegue.

---

## 7. Capturas de pantalla

> ![Home](./public/screenshots/chat%20inicio.jpg)
> ![Chat](./public/screenshots/chat%20con%20yoda.jpg)
> ![About](./public/screenshots/acerca%20de%20yoda.jpg)

---

## 8. Link a la aplicación desplegada

> ⚠️URL pública https://chat-con-yoda-2-c9dn644p0-dario-burbano-s-projects.vercel.app/

---

## 9. Registro del uso de IA en el proyecto

Como parte del aprendizaje del Proyecto Integrador, se usó un asistente de
IA (Claude) como herramienta de apoyo durante el desarrollo. Resumen
honesto de para qué se usó y qué se decidió por criterio propio:

| Tarea | Uso de IA | Decisión/criterio del desarrollador |
|---|---|---|
| Estructura del router con History API | Se pidió un esquema base de router sin librerías | Se revisó y simplificó la API pública (`registerRoute`, `navigate`, `matchRoute`) para que fuera fácil de testear de forma aislada |
| Separación fetch / parseo / render | Sugerencia de IA sobre separar responsabilidades | Se aceptó porque coincide con el objetivo del PI de separar fetching, transformación y renderizado en funciones distintas |
| System prompt de Yoda | Se iteró el prompt con IA probando varias versiones | Se ajustó manualmente para limitar la longitud de respuesta y evitar que el personaje "rompiera el personaje" |
| Función serverless como proxy | Se consultó el patrón recomendado por Google/Vercel para no exponer API keys | Se implementó con validación de entrada propia y manejo explícito de errores 429/500, no solo lo sugerido por la IA |
| Tests con Vitest mockeando fetch | Se pidió ayuda para estructurar el mock de `global.fetch` | Se escribieron casos adicionales propios (red caída, 429, respuesta malformada) para cubrir más escenarios que los sugeridos inicialmente |
| Estilos CSS mobile-first | Se pidió retroalimentación sobre la organización de media queries | Se mantuvo el control del diseño (paleta, layout del chat) y solo se usó la IA para revisar la progresión mobile → tablet → desktop |

**Criterio aplicado:** toda sugerencia de la IA se ejecutó localmente,
se leyó línea por línea, y se ajustó cuando no encajaba con los
objetivos de aprendizaje del PI (por ejemplo, simplificando código
generado que usaba dependencias innecesarias). La IA se usó como
acelerador y "rubber duck", no como reemplazo de la comprensión del
código entregado.

---

## 10. Notas sobre el modelo de IA usado

- Proveedor: **Google Gemini** (Google AI Studio), vía el endpoint
  `generateContent` de la Gemini API.
- Modelo: `gemini-2.5-flash` (rápido y económico, adecuado para una app de
  chat conversacional en tiempo real).
- `temperature: 0.8` para respuestas con algo de variedad sin volverse
  incoherentes.
- `maxOutputTokens: 300` para mantener respuestas breves y controlar costos.
- El "system prompt" de Yoda se envía como `systemInstruction`, separado
  del historial de la conversación (`contents`), que usa los roles
  `user`/`model` (Gemini llama "model" a lo que nosotros llamamos
  "assistant"; la función serverless hace esa conversión).
- Rate limiting: actualmente delegado a los códigos `429` que devuelve la
  propia API de Gemini (la función serverless los detecta y los traduce
  a un mensaje amigable). Una mejora futura razonable sería agregar un
  rate limit propio por IP/sesión en la función serverless.
