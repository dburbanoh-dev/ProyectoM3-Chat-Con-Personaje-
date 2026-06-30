export function renderAbout(container) {
  container.innerHTML = `
    <section class="view view-about">
      <h1>Acerca de este proyecto</h1>

      <article class="card">
        <h2>El personaje</h2>
        <p>
          <strong>Yoda</strong> Yoda es un legendario y poderoso Maestro Jedi en el universo de Star Wars. Reconocido por su baja estatura, piel verde, orejas puntiagudas y su peculiar forma de hablar, destaca como el Gran Maestro de la Orden Jedi, famoso por su inmensa sabiduría, su dominio de la Fuerza y sus habilidades de combate
        </p>
      </article>

      <article class="card">
        <h2>Sobre la POC</h2>
        <p>
          Esta aplicación es una prueba de concepto desarrollada por el
          equipo de ComicSansCon para evaluar la viabilidad de chats con
          personajes ficticios usando inteligencia artificial. Es una SPA
          (Single Page Application) construida con JavaScript, sin
          frameworks de frontend, que navega usando la History API del
          navegador.
        </p>
        <p>
          Las respuestas del personaje se generan a través de la API de
          Gemini, llamada de forma segura desde una función
          serverless de Vercel: la clave de API nunca se expone en el
          navegador.
        </p>
      </article>

      <article class="card">
        <h2>Aviso</h2>
        <p>
          Proyecto educativo / demo interna, sin fines comerciales. No está
          afiliado, respaldado ni patrocinado por Lucasfilm ni Disney.
        </p>
      </article>
    </section>
  `;
}
