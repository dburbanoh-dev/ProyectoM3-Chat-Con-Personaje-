import { chatState, addMessage, resetChat } from '../state.js';
import { sendMessage } from '../services/chatService.js';
import { sanitizeUserInput } from '../utils/parse.js';

/**
 * Pinta la vista de chat completa y conecta sus eventos.
 * Separa render (esta función) de los manejadores de eventos para
 * mantener responsabilidades claras.
 */
export function renderChat(container) {
  resetChat();

  container.innerHTML = `
    <section class="view view-chat">
      <header class="chat-header">
        <h1>Chat con Yoda</h1>
        <button type="button" class="btn btn-ghost" id="reset-btn">Reiniciar</button>
      </header>

      <div class="chat-window" id="chat-window" aria-live="polite">
        <div class="message message-assistant">
          <span class="message-author">Yoda</span>
          <p>Hola quieres preguntarme algo ?.</p>
        </div>
      </div>

      <div class="chat-status" id="chat-status" role="status"></div>

      <form class="chat-form" id="chat-form">
        <label class="sr-only" for="chat-input">Escribe tu mensaje</label>
        <input
          id="chat-input"
          name="chat-input"
          type="text"
          autocomplete="off"
          placeholder="Escribe tu mensaje para Yoda..."
          required
        />
        <button type="submit" class="btn btn-primary" id="send-btn">Enviar</button>
      </form>
    </section>
  `;

  const form = container.querySelector('#chat-form');
  const input = container.querySelector('#chat-input');
  const sendBtn = container.querySelector('#send-btn');
  const resetBtn = container.querySelector('#reset-btn');
  const chatWindow = container.querySelector('#chat-window');
  const statusEl = container.querySelector('#chat-status');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleSend({ input, sendBtn, chatWindow, statusEl });
  });

  resetBtn.addEventListener('click', () => {
    renderChat(container);
  });
}

function appendMessageBubble(chatWindow, role, content) {
  const bubble = document.createElement('div');
  bubble.className = `message message-${role}`;
  const author = document.createElement('span');
  author.className = 'message-author';
  author.textContent = role === 'user' ? 'Tú' : 'Yoda';
  const text = document.createElement('p');
  text.textContent = content;
  bubble.append(author, text);
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setLoading(isLoading, { sendBtn, statusEl }) {
  chatState.isLoading = isLoading;
  sendBtn.disabled = isLoading;
  statusEl.classList.toggle('is-loading', isLoading);
  statusEl.textContent = isLoading ? 'Yoda está pensando...' : '';
}

function showError(message, statusEl) {
  chatState.error = message;
  statusEl.classList.remove('is-loading');
  statusEl.classList.add('is-error');
  statusEl.textContent = message;
}

async function handleSend({ input, sendBtn, chatWindow, statusEl }) {
  const text = sanitizeUserInput(input.value);
  if (!text || chatState.isLoading) return;

  statusEl.classList.remove('is-error');
  statusEl.textContent = '';

  addMessage('user', text);
  appendMessageBubble(chatWindow, 'user', text);
  input.value = '';

  setLoading(true, { sendBtn, statusEl });

  try {
    const reply = await sendMessage(chatState.messages);
    addMessage('assistant', reply);
    appendMessageBubble(chatWindow, 'assistant', reply);
  } catch (err) {
    showError(err.message || 'Algo salió mal. Inténtalo de nuevo.', statusEl);
  } finally {
    setLoading(false, { sendBtn, statusEl });
  }
}
