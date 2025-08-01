// SPRITE LOADER FIXED - Versión corregida para Netlify
export class SpriteLoader {
    constructor() {
        this.manifest = null;
    }

    async loadManifest() {
        if (!this.manifest) {
            try {
                console.log('🔄 SpriteLoader: Iniciando carga de manifest...');
                
                // USAR SOLO RUTA ABSOLUTA PARA EVITAR PROBLEMAS
                const manifestUrl = '/spriteManifest.json';
                console.log(`📡 Solicitando: ${manifestUrl}`);
                
                const response = await fetch(manifestUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`📡 Response status: ${response.status}`);
                console.log(`📡 Response headers:`, response.headers);
                console.log(`📡 Content-Type: ${response.headers.get('content-type')}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const text = await response.text();
                console.log(`📄 Manifest text received (${text.length} chars): ${text.substring(0, 100)}...`);
                
                // Verificar que es JSON válido
                if (!text.trim().startsWith('{')) {
                    throw new Error(`Invalid JSON format. First 200 chars: ${text.substring(0, 200)}`);
                }
                
                this.manifest = JSON.parse(text);
                console.log(`✅ Manifest parsed successfully. Characters: ${Object.keys(this.manifest).length}`);
                console.log(`📋 Available characters:`, Object.keys(this.manifest));
                
            } catch (error) {
                console.error('❌ SpriteLoader Error:', error);
                console.error('❌ Stack:', error.stack);
                throw new Error(`Failed to load sprite manifest: ${error.message}`);
            }
        }
        return this.manifest;
    }

    // Carga sprites de un personaje según spriteManifest.json
    async loadSprites(characterName) {
        const manifest = await this.loadManifest();
        const data = manifest[characterName];
        
        if (!data) {
            console.error(`❌ No manifest for ${characterName}. Available:`, Object.keys(manifest));
            
            // Buscar coincidencia parcial
            const matchedKey = Object.keys(manifest).find(key => 
                key.toLowerCase().includes(characterName.toLowerCase()) || 
                characterName.toLowerCase().includes(key.toLowerCase())
            );
            
            if (matchedKey) {
                console.log(`🔄 Using ${matchedKey} as fallback`);
                return this.loadSprites(matchedKey);
            }
            
            throw new Error(`No sprite data for character: ${characterName}`);
        }

        // Cargar imágenes
        const sprites = {};
        for (const stateFolder in data) {
            const files = data[stateFolder];
            console.log(`🖼️ Loading ${files.length} images for ${characterName}/${stateFolder}`);
            
            const imgs = await Promise.all(files.map(file => new Promise((resolve, reject) => {
                const img = new Image();
                let url = file.replace(/\\/g, '/');
                if (!url.startsWith('/')) url = '/' + url;
                
                img.onload = () => {
                    console.log(`✅ Image loaded: ${url}`);
                    resolve(img);
                };
                
                img.onerror = (err) => {
                    console.error(`❌ Failed to load image: ${url}`, err);
                    reject(new Error(`Failed to load image: ${url}`));
                };
                
                img.src = url;
            })));
            
            sprites[stateFolder] = imgs;
        }

        console.log(`✅ All sprites loaded for ${characterName}`);
        return sprites;
    }

    // Obtener lista de personajes disponibles
    async getAvailableCharacters() {
        const manifest = await this.loadManifest();
        return Object.keys(manifest);
    }

    // Verificar si un personaje existe
    async hasCharacter(characterName) {
        const manifest = await this.loadManifest();
        return !!manifest[characterName];
    }
}
