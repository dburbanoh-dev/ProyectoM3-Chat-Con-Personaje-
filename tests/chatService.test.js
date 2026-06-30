import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendMessage } from '../src/services/chatService.js';

function mockFetchOnce({ ok, status = 200, json }) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(json)
  });
}

describe('sendMessage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('hace POST a /api/chat con el historial y devuelve el texto de respuesta', async () => {
    mockFetchOnce({ ok: true, json: { reply: 'Mmm, interesante pregunta, haces.' } });

    const messages = [{ role: 'user', content: '¿Qué es la Fuerza?' }];
    const reply = await sendMessage(messages);

    expect(reply).toBe('Mmm, interesante pregunta, haces.');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' })
      })
    );

    const sentBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(sentBody).toEqual({ messages: [{ role: 'user', content: '¿Qué es la Fuerza?' }] });
  });

  it('lanza un error legible cuando el servidor responde con un error genérico', async () => {
    mockFetchOnce({ ok: false, status: 500, json: { error: 'Falla interna' } });

    await expect(sendMessage([{ role: 'user', content: 'hola' }])).rejects.toThrow('Falla interna');
  });

  it('lanza un mensaje específico de rate limiting cuando el servidor responde 429', async () => {
    mockFetchOnce({ ok: false, status: 429, json: {} });

    await expect(sendMessage([{ role: 'user', content: 'hola' }])).rejects.toThrow(/demasiadas peticiones/i);
  });

  it('lanza un error de conexión si fetch rechaza la promesa (sin red)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(sendMessage([{ role: 'user', content: 'hola' }])).rejects.toThrow(/no se pudo conectar/i);
  });
});
