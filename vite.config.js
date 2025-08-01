// Vite config básico para proyecto ES Modules
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist'
  },
  publicDir: 'public'
});
