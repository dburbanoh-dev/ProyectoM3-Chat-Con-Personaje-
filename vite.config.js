import { defineConfig } from 'vite';

export default defineConfig({
  // El proyecto es una SPA "vanilla" (sin framework), servida desde la raíz.
  root: '.',
  server: {
    port: 5173,
    // En desarrollo local con `vite` puro no existen las funciones serverless.
    // Para probar /api/chat de verdad usa `vercel dev` (ver README).
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist'
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.js']
  }
});
