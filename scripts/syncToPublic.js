/**
 * Script para sincronizar archivos de src/ hacia public/
 * Mantiene src/ como fuente de desarrollo y public/ para build
 */

const { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } = require('fs');
const { join, dirname } = require('path');

const srcDir = './src';
const publicDir = './public';

function copyDirectory(src, dest) {
  // Crear directorio destino si no existe
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
      // Crear directorio padre si no existe
      const parentDir = dirname(destPath);
      if (!existsSync(parentDir)) {
        mkdirSync(parentDir, { recursive: true });
      }
      copyFileSync(srcPath, destPath);
    }
  }
}

function syncToPublic() {
  console.log('🔄 Sincronizando src/ → public/...');
  
  try {
    // Copiar carpetas de código
    copyDirectory(srcDir, publicDir);
    
    // Copiar archivos HTML adicionales (excepto index.html)
    const htmlFiles = ['app.html', 'main-menu.html', 'start.html', 'connectivity-test.html'];
    for (const file of htmlFiles) {
      if (existsSync(file)) {
        copyFileSync(file, join(publicDir, file));
      }
    }
    
    // Copiar otros archivos necesarios
    const otherFiles = ['style.css', 'main.js', 'spriteManifest.json'];
    for (const file of otherFiles) {
      if (existsSync(file)) {
        copyFileSync(file, join(publicDir, file));
      }
    }
    
    console.log('✅ Sincronización completada');
  } catch (error) {
    console.error('❌ Error en sincronización:', error.message);
    process.exit(1);
  }
}

// Ejecutar sincronización
syncToPublic();
