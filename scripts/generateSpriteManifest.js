/**
 * Script para Node.js que recorre la carpeta 'sprites' y genera un manifest JSON
 * con la lista de personajes, estados y rutas de frames para cada animación.
 */
const fs = require('fs');
const path = require('path');
const spritesDir = path.resolve(__dirname, '../sprites');
const manifest = {};

// Función para convertir paths de Windows a paths web
function toWebPath(filePath) {
  return filePath.replace(/\\/g, '/');
}

fs.readdirSync(spritesDir).forEach(character => {
  const charPath = path.join(spritesDir, character);
  if (!fs.statSync(charPath).isDirectory()) return;
  manifest[character] = {};
  fs.readdirSync(charPath).forEach(state => {
    const statePath = path.join(charPath, state);
    if (!fs.statSync(statePath).isDirectory()) return;
    const files = fs.readdirSync(statePath)
      .filter(f => f.match(/\.(png|gif)$/i))
      .sort((a, b) => a.localeCompare(b));
    manifest[character][state] = files.map(f => toWebPath(path.join('sprites', character, state, f)));
  });
});

fs.writeFileSync(path.resolve(__dirname, '../spriteManifest.json'), JSON.stringify(manifest, null, 2));
console.log('spriteManifest.json generado con paths web compatibles');
