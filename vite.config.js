// Vite config para proyecto ES Modules con compatibilidad Node.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    target: 'es2015',
    rollupOptions: {
      external: []
    }
  },
  publicDir: 'public',
  define: {
    global: 'globalThis'
  }
});
