const routes = [];

/**
 * Registra una ruta.
 * @param {string} path - ej. "/", "/chat", "/about"
 * @param {(container: HTMLElement) => void} render - función que pinta la vista
 */
export function registerRoute(path, render) {
  routes.push({ path, render });
}

/**
 * Devuelve la ruta registrada que coincide con el pathname dado.
 * Si no hay coincidencia, devuelve la ruta "/" como fallback (o null si no existe).
 */
export function matchRoute(pathname) {
  const found = routes.find((r) => r.path === pathname);
  if (found) return found;
  return routes.find((r) => r.path === '/') || null;
}

/**
 * Pinta la ruta actual (según window.location.pathname) dentro del contenedor.
 */
export function renderCurrentRoute(container) {
  const route = matchRoute(window.location.pathname);
  if (!route) {
    container.innerHTML = '<p>404 - Página no encontrada</p>';
    return;
  }
  route.render(container);
}

/**
 * Navega a una nueva ruta sin recargar la página, usando pushState,
 * y vuelve a renderizar.
 */
export function navigate(path, container) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  renderCurrentRoute(container);
}

/**
 * Inicializa el router:
 * - Intercepta clics en enlaces con [data-link] para navegar sin recargar.
 * - Escucha el evento popstate (botones atrás/adelante del navegador).
 * - Renderiza la ruta inicial.
 */
export function initRouter(container) {
  document.body.addEventListener('click', (event) => {
    const link = event.target.closest('[data-link]');
    if (!link) return;
    event.preventDefault();
    navigate(link.getAttribute('href'), container);
  });

  window.addEventListener('popstate', () => renderCurrentRoute(container));

  renderCurrentRoute(container);
}
