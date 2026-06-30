import { registerRoute, initRouter } from './router.js';
import { renderHome } from './views/home.js';
import { renderChat } from './views/chat.js';
import { renderAbout } from './views/about.js';

const app = document.getElementById('app');

registerRoute('/', renderHome);
registerRoute('/chat', renderChat);
registerRoute('/about', renderAbout);

initRouter(app);
