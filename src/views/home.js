export function renderHome(container) {
  container.innerHTML = `
    <section class="view view-home">
      <div class="hero">
        <img
          class="hero-avatar"
          src="/yoda-avatar.svg"
          alt="Ilustración de Yoda"
          width="120"
          height="120"
        />
        <h1>Habla con Yoda</h1>
        <p class="hero-subtitle">
          Una pequeña prueba de concepto de ComicSansCon: conversaciones con
          personajes ficticios potenciadas por IA.
        </p>
        <a href="/chat" data-link class="btn btn-primary">Iniciar chat</a>
        <a href="/about" data-link class="btn btn-secondary">Acerca del proyecto</a>
      </div>
    </section>
  `;
}
