/**
 * Estado en memoria del chat. Al ser una POC, no se persiste en localStorage
 * a propósito: cada recarga completa empieza una conversación nueva.
 */
export const chatState = {
  messages: [
    // { role: 'user' | 'assistant', content: string }
  ],
  isLoading: false,
  error: null
};

export function addMessage(role, content) {
  chatState.messages.push({ role, content });
}

export function resetChat() {
  chatState.messages = [];
  chatState.isLoading = false;
  chatState.error = null;
}
