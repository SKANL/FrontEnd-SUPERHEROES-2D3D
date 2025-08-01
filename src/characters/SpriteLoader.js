// Carga de sprites para luchadores
export class SpriteLoader {
    constructor() {
        this.manifest = null;
    }

    async loadManifest() {
        if (!this.manifest) {
            try {
                // Intentar múltiples rutas para el manifest
                const possiblePaths = [
                    '/spriteManifest.json',           // Ruta absoluta desde la raíz
                    './spriteManifest.json',          // Ruta relativa actual
                    '../spriteManifest.json',         // Un nivel arriba
                    '../../spriteManifest.json',      // Dos niveles arriba (para ui/teamBattles/)
                    '../../../spriteManifest.json'    // Tres niveles arriba
                ];
                
                let response = null;
                let successPath = null;
                
                for (const path of possiblePaths) {
                    try {
                        console.log(`Intentando cargar manifest desde: ${path}`);
                        response = await fetch(path);
                        if (response.ok) {
                            successPath = path;
                            console.log(`✅ Manifest encontrado en: ${path}`);
                            break;
                        } else {
                            console.log(`❌ No encontrado en: ${path} (${response.status})`);
                        }
                    } catch (error) {
                        console.log(`❌ Error al acceder a: ${path} - ${error.message}`);
                        continue;
                    }
                }
                
                if (!response || !response.ok) {
                    throw new Error(`No se pudo cargar spriteManifest.json desde ninguna ruta. Intentadas: ${possiblePaths.join(', ')}`);
                }
                
                const text = await response.text();
                console.log(`📄 Manifest cargado desde ${successPath} (${text.length} caracteres)`);
                
                // Verificar que el contenido parece ser JSON válido
                if (!text.trim().startsWith('{')) {
                    throw new Error(`El contenido no parece ser JSON válido. Primeros 100 chars: ${text.substring(0, 100)}`);
                }
                
                this.manifest = JSON.parse(text);
                console.log(`✅ Manifest parseado correctamente. Personajes: ${Object.keys(this.manifest).length}`);
                
            } catch (error) {
                console.error('❌ Error loading sprite manifest:', error);
                throw error;
            }
        }
        return this.manifest;
    }

    /**
     * Carga dinámicamente todas las animaciones de un personaje.
     * @param {string} characterFolder Nombre de la carpeta bajo sprites/
     * @returns {Promise<Record<string, HTMLImageElement[]>>}
     */
    // Carga sprites de un personaje según spriteManifest.json
    async loadSprites(characterName) {
        const manifest = await this.loadManifest();
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
    /**
     * Busca un personaje en el manifest por nombre parcial o completo
     * @param {string} searchTerm - Término de búsqueda
     * @returns {string|null} - Clave encontrada en el manifest o null
     */
    findCharacterInManifest(searchTerm) {
        if (!searchTerm || typeof searchTerm !== 'string') {
            return null;
        }
        
        const search = searchTerm.toLowerCase();
        console.log(`Buscando en manifest: "${searchTerm}"`);
        console.log('Claves disponibles:', Object.keys(manifest));
        
        // Búsqueda exacta primero
        if (manifest[searchTerm]) {
            console.log(`Encontrado exacto: ${searchTerm}`);
            return searchTerm;
        }
        
        // Búsqueda por coincidencia de nombres
        const matches = Object.keys(manifest).filter(key => {
            const keyLower = key.toLowerCase();
            return keyLower.includes(search) || search.includes(keyLower);
        });
        
        if (matches.length > 0) {
            console.log(`Encontradas coincidencias:`, matches);
            return matches[0]; // Retornar la primera coincidencia
        }
        
        // Búsqueda más específica para personajes conocidos
        const characterMappings = {
            'baraka': ['Baraka Complete Edicion', 'Baraka'],
            'cyrax': ['Cyrax Complete Edicion', 'Cyrax'],
            'player2': ['player2', 'Cyrax Complete Edicion', 'Baraka Complete Edicion']
        };
        
        if (characterMappings[search]) {
            for (const mapping of characterMappings[search]) {
                if (manifest[mapping]) {
                    console.log(`Encontrado por mapeo: ${mapping}`);
                    return mapping;
                }
            }
        }
        
        console.log(`No se encontró: ${searchTerm}`);
        return null;
    }

    /**
     * Carga sprites con búsqueda inteligente en manifest
     * @param {string} characterName - Nombre del personaje
     * @returns {Promise<Object>} - Sprites cargados
     */
    async loadSpritesWithFallback(characterName) {
        try {
            // Intentar carga directa primero
            return await this.loadSprites(characterName);
        } catch (error) {
            console.warn(`Error cargando "${characterName}", buscando alternativas...`);
            
            // Buscar en manifest
            const foundKey = this.findCharacterInManifest(characterName);
            if (foundKey) {
                try {
                    return await this.loadSprites(foundKey);
                } catch (e) {
                    console.warn(`Error cargando alternativa "${foundKey}":`, e);
                }
            }
            
            // Fallback final
            console.log('Usando Baraka como fallback final');
            return await this.loadBarakaSprites();
        }
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
        console.log(`Cargando ${files.length} imágenes de ${folder}`);
        
        // Usar rutas absolutas para Vite
        const loaded = await Promise.all(files.map((file, index) => {
            return new Promise(resolve => {
                const img = new Image();
                // Construir ruta correcta para Vite
                const imagePath = file.startsWith('/') ? file : `/${file}`;
                img.src = imagePath;
                
                img.onload = () => {
                    console.log(`✓ Imagen cargada: ${imagePath}`);
                    resolve(img);
                };
                
                img.onerror = () => {
                    console.warn(`✗ Error cargando imagen: ${imagePath}`);
                    resolve(null);
                };
                
                // Timeout para evitar bloqueos
                setTimeout(() => {
                    if (!img.complete) {
                        console.warn(`⏰ Timeout cargando imagen: ${imagePath}`);
                        resolve(null);
                    }
                }, 5000);
            });
        }));
        
        // Filtra imágenes rotas
        const validImages = loaded.filter(img => img && img.complete && img.naturalWidth > 0);
        console.log(`${validImages.length}/${files.length} imágenes cargadas exitosamente para ${folder}`);
        
        return validImages;
    }
}
