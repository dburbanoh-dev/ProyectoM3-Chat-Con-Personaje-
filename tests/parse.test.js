import { describe, it, expect } from 'vitest';
import { extractReplyText, toApiMessages, sanitizeUserInput } from '../src/utils/parse.js';

describe('extractReplyText', () => {
  it('extrae el texto cuando la respuesta tiene la forma esperada', () => {
    const data = { reply: '  Hablar contigo, un placer es.  ' };
    expect(extractReplyText(data)).toBe('Hablar contigo, un placer es.');
  });

  it('lanza un error si falta el campo "reply"', () => {
    expect(() => extractReplyText({})).toThrow(/falta el campo "reply"/i);
  });

  it('lanza un error si la respuesta no es un objeto', () => {
    expect(() => extractReplyText(null)).toThrow(/respuesta inválida/i);
    expect(() => extractReplyText('texto plano')).toThrow(/respuesta inválida/i);
  });

  it('lanza un error si "reply" está vacío', () => {
    expect(() => extractReplyText({ reply: '   ' })).toThrow(/falta el campo "reply"/i);
  });
});

describe('toApiMessages', () => {
  it('mapea el historial a objetos con solo role y content', () => {
    const messages = [
      { role: 'user', content: 'Hola', extraField: 'ignorar' },
      { role: 'assistant', content: 'Saludos' }
    ];
    expect(toApiMessages(messages)).toEqual([
      { role: 'user', content: 'Hola' },
      { role: 'assistant', content: 'Saludos' }
    ]);
  });

  it('devuelve un arreglo vacío si el historial está vacío', () => {
    expect(toApiMessages([])).toEqual([]);
  });
});

describe('sanitizeUserInput', () => {
  it('elimina espacios al inicio y al final', () => {
    expect(sanitizeUserInput('  hola  ')).toBe('hola');
  });

  it('devuelve cadena vacía para valores nulos o undefined', () => {
    expect(sanitizeUserInput(null)).toBe('');
    expect(sanitizeUserInput(undefined)).toBe('');
  });
});
