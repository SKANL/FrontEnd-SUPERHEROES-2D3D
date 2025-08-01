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
    assetsDir: 'assets',
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    minify: 'esbuild'
  },
  publicDir: 'public',
  define: {
    global: 'globalThis'
  },
  assetsInclude: ['**/*.json']
});
