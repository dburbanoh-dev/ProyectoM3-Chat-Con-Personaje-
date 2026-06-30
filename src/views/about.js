export function renderAbout(container) {
  container.innerHTML = `
    <section class="view view-about">
      <h1>Acerca de este proyecto</h1>

      <article class="card">
        <h2>El personaje</h2>
        <p>
          <strong>Yoda</strong> es un maestro Jedi de la franquicia
          <em>Star Wars</em>, conocido por su sabiduría, su sintaxis
          invertida y sus enseñanzas sobre la Fuerza. En esta POC, Yoda
          responde con su estilo característico a cualquier pregunta que le
          hagas.
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
          Claude (Anthropic), llamada de forma segura desde una función
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
