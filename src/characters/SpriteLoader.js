// SpriteLoader - Versión final limpia sin conflictos de MIME
export class SpriteLoader {
    constructor() {
        this.manifest = null;
        this.cache = new Map();
    }

    async loadManifest() {
        if (!this.manifest) {
            try {
                console.log('🎮 SpriteLoader: Iniciando carga de manifest...');
                
                // Intentar cargar desde archivo de texto para evitar MIME issues
                let response = await fetch('/sprites-data.txt', {
                    headers: { 'Accept': 'text/plain' }
                });
                
                // Fallback a JSON si el TXT no existe
                if (!response.ok) {
                    console.log('⚠️ sprites-data.txt no encontrado, intentando JSON...');
                    response = await fetch('/spriteManifest.json', {
                        headers: { 'Accept': 'application/json' }
                    });
                }
                
                if (!response.ok) {
                    throw new Error(`No se pudo cargar manifest: ${response.status}`);
                }
                
                const text = await response.text();
                this.manifest = JSON.parse(text);
                
                console.log(`✅ Manifest cargado: ${Object.keys(this.manifest).length} personajes`);
                console.log('📋 Personajes disponibles:', Object.keys(this.manifest));
                
            } catch (error) {
                console.error('❌ Error cargando manifest:', error);
                console.log('🔄 Usando manifest básico de emergencia...');
                this.manifest = this.getBasicManifest();
            }
        }
        return this.manifest;
    }

    getBasicManifest() {
        return {
            "Baraka Complete Edicion": {
                "idle": ["/sprites/Baraka Complete Edicion/Baraka Portada_01.png"],
                "walk": ["/sprites/Baraka Complete Edicion/Baraka Caminar/Baraka Caminar_00.png"],
                "damage": ["/sprites/Baraka Complete Edicion/Baraka Damage/Baraka Damage_00.png"],
                "dead": ["/sprites/Baraka Complete Edicion/Baraka Dead/Baraka Dead_00.png"]
            },
            "Cyrax Complete Edicion": {
                "idle": ["/sprites/Cyrax Complete Edicion/Cyrax Portada_01.png"],
                "walk": ["/sprites/Cyrax Complete Edicion/Cyrax Caminar/Cyrax Caminar_00.png"],
                "damage": ["/sprites/Cyrax Complete Edicion/Cyrax Damage/Cyrax Damage_00.png"],
                "dead": ["/sprites/Cyrax Complete Edicion/Cyrax Dead/Cyrax Dead_00.png"]
            }
        };
    }

    async loadSprites(characterName) {
        // Verificar cache primero
        if (this.cache.has(characterName)) {
            console.log(`📦 Sprites de ${characterName} desde cache`);
            return this.cache.get(characterName);
        }

        const manifest = await this.loadManifest();
        const data = manifest[characterName];
        
        if (!data) {
            console.warn(`❌ No hay datos para ${characterName}`);
            
            // Buscar coincidencia parcial
            const similarKey = Object.keys(manifest).find(key => 
                key.toLowerCase().includes(characterName.toLowerCase()) || 
                characterName.toLowerCase().includes(key.toLowerCase())
            );
            
            if (similarKey) {
                console.log(`🔄 Usando ${similarKey} como alternativa`);
                return this.loadSprites(similarKey);
            }
            
            // Usar sprites básicos si no hay coincidencia
            return this.createBasicSprites();
        }

        console.log(`🖼️ Cargando sprites para ${characterName}...`);
        
        const sprites = {};
        for (const [stateName, files] of Object.entries(data)) {
            try {
                const images = await Promise.all(
                    files.map(file => this.loadSingleImage(file))
                );
                sprites[stateName] = images.filter(img => img !== null);
                
                if (sprites[stateName].length === 0) {
                    sprites[stateName] = [this.createPlaceholderImage()];
                }
                
            } catch (error) {
                console.warn(`⚠️ Error cargando estado ${stateName}:`, error);
                sprites[stateName] = [this.createPlaceholderImage()];
            }
        }

        // Guardar en cache
        this.cache.set(characterName, sprites);
        console.log(`✅ Sprites cargados para ${characterName}:`, Object.keys(sprites));
        
        return sprites;
    }

    async loadSingleImage(filePath) {
        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => {
                console.log(`✅ Imagen cargada: ${filePath}`);
                resolve(img);
            };
            
            img.onerror = () => {
                console.warn(`❌ Error cargando: ${filePath}`);
                resolve(null);
            };
            
            // Asegurar ruta correcta
            let url = filePath.replace(/\\/g, '/');
            if (!url.startsWith('/')) url = '/' + url;
            
            img.src = url;
        });
    }

    createBasicSprites() {
        const placeholder = this.createPlaceholderImage();
        return {
            idle: [placeholder],
            walk: [placeholder],
            damage: [placeholder],
            dead: [placeholder]
        };
    }

    createPlaceholderImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Crear sprite básico
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(10, 10, 80, 80);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SPRITE', 50, 55);
        
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    async getAvailableCharacters() {
        const manifest = await this.loadManifest();
        return Object.keys(manifest);
    }

    async hasCharacter(characterName) {
        const manifest = await this.loadManifest();
        return !!manifest[characterName];
    }

    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache de sprites limpiado');
    }
}
