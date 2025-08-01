/**
 * Script de build manual como alternativa a Vite
 * En caso de que Vite falle en Netlify
 */

const { copyFileSync, mkdirSync, readdirSync, statSync, existsSync, rmSync } = require('fs');
const { join, dirname } = require('path');

const publicDir = './public';
const distDir = './dist';

function copyDirectory(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src);
  
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    
    if (statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      const parentDir = dirname(destPath);
      if (!existsSync(parentDir)) {
        mkdirSync(parentDir, { recursive: true });
      }
      copyFileSync(srcPath, destPath);
    }
  }
}

function manualBuild() {
  console.log('🔄 Build manual iniciado...');
  
  try {
    // Limpiar dist
    if (existsSync(distDir)) {
      rmSync(distDir, { recursive: true, force: true });
    }
    mkdirSync(distDir, { recursive: true });

    // Copiar index.html
    copyFileSync('./index.html', join(distDir, 'index.html'));
    
    // Copiar todo el contenido de public
    if (existsSync(publicDir)) {
      copyDirectory(publicDir, distDir);
    }
    
    console.log('✅ Build manual completado');
  } catch (error) {
    console.error('❌ Error en build manual:', error.message);
    process.exit(1);
  }
}

manualBuild();
