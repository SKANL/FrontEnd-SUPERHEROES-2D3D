import manifest from '../spriteManifest.json';
// Carga de sprites para luchadores
export class SpriteLoader {
    /**
     * Carga dinámicamente todas las animaciones de un personaje.
     * @param {string} characterFolder Nombre de la carpeta bajo sprites/
     * @returns {Promise<Record<string, HTMLImageElement[]>>}
     */
    // Carga sprites de un personaje según spriteManifest.json
    async loadSprites(characterName) {
        const data = manifest[characterName];
        if (!data) {
            console.error(`No hay manifest para ${characterName}. Claves disponibles:`, Object.keys(manifest));
            // Buscar nombre que pueda coincidir parcialmente (por si hay problemas de espacios o mayúsculas)
            const matchedKey = Object.keys(manifest).find(key => 
                key.toLowerCase().includes(characterName.toLowerCase()) || 
                characterName.toLowerCase().includes(key.toLowerCase())
            );
            if (matchedKey) {
                console.log(`Usando ${matchedKey} como alternativa`);
                return this.loadSprites(matchedKey);
            }
            throw new Error(`No hay manifest para ${characterName}`);
        }

        // Cargar imágenes en crudo
        const raw = {};
        for (const stateFolder in data) {
            const files = data[stateFolder];
            console.log(`Cargando ${files.length} imágenes para ${characterName}/${stateFolder}`);
            
            const imgs = await Promise.all(files.map(file => new Promise(resolve => {
                const img = new Image();
                // Normalizar separadores de ruta para URL
                let url = file.replace(/\\/g, '/');
                if (!url.startsWith('/')) url = '/' + url;
                img.src = url;
                img.onload = () => {
                    console.log(`Imagen cargada: ${url}`);
                    resolve(img);
                };
                img.onerror = (err) => {
                    console.error(`Error cargando imagen ${url}`, err);
                    resolve(null);
                };
            })));
            
            raw[stateFolder] = imgs.filter(i => i);
            console.log(`${raw[stateFolder].length} imágenes válidas cargadas para ${stateFolder}`);
        }

        // Mapear carpetas a estados del juego
        const animations = {};
        for (const folder in raw) {
            const list = raw[folder];
            
            // Mapear nombres de carpeta a estados del juego
            const key = (folder.toLowerCase().includes('portada') || folder.toLowerCase().includes('poses')) ? 'idle'
                : (folder.toLowerCase().includes('caminar')) ? 'walking'
                : (folder.toLowerCase().includes('golpe')) ? 'punching'
                : (folder.toLowerCase().includes('patada')) ? 'kicking'
                : (folder.toLowerCase().includes('defens')) ? 'defense'
                : (folder.toLowerCase().includes('dead') || folder.toLowerCase().includes('muert')) ? 'dead'
                : (folder.toLowerCase().includes('winner') || folder.toLowerCase().includes('wins')) ? 'winner'
                // Mapeos adicionales para habilidades especiales
                : (folder.toLowerCase().includes('cuchilla') && !folder.toLowerCase().includes('rayo') && !folder.toLowerCase().includes('multi')) ? 'specialBlade'
                : (folder.toLowerCase().includes('rayo')) ? 'rayBlade'
                : (folder.toLowerCase().includes('multi')) ? 'multiBlade'
                : (folder.toLowerCase().includes('agarrar') || folder.toLowerCase().includes('lanzar')) ? 'grab'
                : (folder.toLowerCase().includes('freinship') || folder.toLowerCase().includes('friendship')) ? 'friendship'
                : (folder.toLowerCase().includes('baba')) ? 'babality'
                : (folder.toLowerCase().includes('style')) ? 'style'
                : (folder.toLowerCase().includes('mariado') || folder.toLowerCase().includes('dizzy')) ? 'dizzy'
                : folder;
            
            // Solo añadir si hay imágenes válidas
            if (list && list.length > 0) {
                animations[key] = list;
                console.log(`Mapeado ${folder} → ${key} con ${list.length} imágenes`);
            }
        }

        // Validar que tengamos al menos una animación idle
        if (!animations['idle'] || animations['idle'].length === 0) {
            console.warn(`No hay animación idle para ${characterName}, buscando alternativa`);
            // Buscar cualquier animación con frames para usarla como idle
            for (const key in animations) {
                if (animations[key] && animations[key].length > 0) {
                    console.log(`Usando ${key} como idle alternativo`);
                    animations['idle'] = animations[key];
                    break;
                }
            }
        }

        console.log(`Estados de animación disponibles para ${characterName}:`, Object.keys(animations));
        return animations;
    }
    // Alias para compatibilidad: carga sprites de Baraka
    async loadBarakaSprites() {
        // Intentar cargar con el nombre completo
        try {
            return await this.loadSprites('Baraka Complete Edicion');
        } catch (error) {
            console.warn("Error cargando 'Baraka Complete Edicion', intentando con 'Baraka':", error);
            try {
                // Intento alternativo con nombre parcial
                const barakaKey = Object.keys(manifest).find(key => key.includes('Baraka'));
                if (barakaKey) {
                    console.log(`Encontrada clave alternativa: ${barakaKey}`);
                    return await this.loadSprites(barakaKey);
                }
            } catch (e) {
                console.error("No se pudo cargar ningún personaje Baraka:", e);
            }
            
            // Si todo falla, carga un personaje genérico
            const firstCharacter = Object.keys(manifest)[0];
            if (firstCharacter) {
                console.log(`Usando personaje alternativo: ${firstCharacter}`);
                return await this.loadSprites(firstCharacter);
            } else {
                throw new Error("No hay personajes disponibles en el manifest");
            }
        }
    }

    /**
     * Carga sprites de player2 o utiliza Baraka como fallback.
     */
    async loadPlayer2Sprites() {
        try {
            return await this.loadSprites('player2');
        } catch {
            return this.loadBarakaSprites();
        }
    }

    async loadImages(folder, files) {
        // Usar rutas absolutas para Vite
        const loaded = await Promise.all(files.map(file => {
            return new Promise(resolve => {
                const img = new Image();
                // Vite sirve archivos estáticos desde la raíz
                img.src = `/${folder}/${file}`;
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
            });
        }));
        // Filtra imágenes rotas
        return loaded.filter(img => img && img.complete && img.naturalWidth > 0);
    }
}
