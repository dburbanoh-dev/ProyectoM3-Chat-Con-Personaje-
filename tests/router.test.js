import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerRoute, matchRoute, navigate } from '../src/router.js';

describe('matchRoute', () => {
  it('devuelve la ruta registrada que coincide exactamente con el pathname', () => {
    registerRoute('/test-only', () => {});
    const route = matchRoute('/test-only');
    expect(route.path).toBe('/test-only');
  });

  it('usa "/" como fallback cuando el pathname no coincide con ninguna ruta', () => {
    const homeRender = vi.fn();
    registerRoute('/', homeRender);
    const route = matchRoute('/ruta-que-no-existe');
    expect(route.path).toBe('/');
  });
});

describe('navigate', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('actualiza window.location.pathname usando pushState y renderiza el contenedor', () => {
    const render = vi.fn();
    registerRoute('/chat', render);
    const container = document.createElement('div');

    navigate('/chat', container);

    expect(window.location.pathname).toBe('/chat');
    expect(render).toHaveBeenCalledWith(container);
  });

  it('no hace nada si ya se está en esa ruta (evita renders redundantes)', () => {
    const render = vi.fn();
    registerRoute('/about', render);
    const container = document.createElement('div');

    navigate('/about', container);
    render.mockClear();
    navigate('/about', container);

    expect(render).not.toHaveBeenCalled();
  });
});
