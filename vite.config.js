// Vite config para proyecto ES Modules con compatibilidad Node.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    open: true,
    host: '127.0.0.1',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With'
    },
    // Configurar MIME types correctos para el servidor de desarrollo
    middlewareMode: false,
    fs: {
      strict: false
    }
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
    minify: 'esbuild',
    // Asegurar que los archivos JSON se copien correctamente
    copyPublicDir: true
  },
  publicDir: 'public',
  define: {
    global: 'globalThis'
  },
  assetsInclude: ['**/*.json'],
  // Configurar plugin para manejar MIME types
  plugins: [
    {
      name: 'mime-types',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          } else if (req.url.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          next();
        });
      }
    }
  ]
});
