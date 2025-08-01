// SPRITE LOADER NUCLEAR - Versión que evita completamente problemas de MIME
export class SpriteLoader {
    constructor() {
        this.manifest = null;
    }

    async loadManifest() {
        if (!this.manifest) {
            try {
                console.log('🔄 SpriteLoader NUCLEAR: Iniciando carga...');
                
                // RUTA ALTERNATIVA PARA EVITAR CONFLICTOS
                const manifestUrl = '/sprites-data.txt'; // Cambiar extensión
                console.log(`📡 Solicitando: ${manifestUrl}`);
                
                const response = await fetch(manifestUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/plain', // Cambiar tipo esperado
                        'Cache-Control': 'no-cache'
                    }
                });
                
                console.log(`📡 Response status: ${response.status}`);
                console.log(`📡 Content-Type: ${response.headers.get('content-type')}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const text = await response.text();
                console.log(`📄 Data received (${text.length} chars)`);
                
                // Verificar que es JSON válido
                if (!text.trim().startsWith('{')) {
                    throw new Error(`Invalid format. First 100 chars: ${text.substring(0, 100)}`);
                }
                
                this.manifest = JSON.parse(text);
                console.log(`✅ Manifest parsed. Characters: ${Object.keys(this.manifest).length}`);
                
            } catch (error) {
                console.error('❌ SpriteLoader NUCLEAR Error:', error);
                
                // FALLBACK: Usar manifest embebido si falla
                console.log('🔄 Using embedded fallback manifest...');
                this.manifest = this.getEmbeddedManifest();
            }
        }
        return this.manifest;
    }

    // Manifest de emergencia embebido
    getEmbeddedManifest() {
        return {
            "Baraka Complete Edicion": {
                "Baraka Caminar": [
                    "/sprites/Baraka Complete Edicion/Baraka Caminar/Baraka Caminar_00.png",
                    "/sprites/Baraka Complete Edicion/Baraka Caminar/Baraka Caminar_01.png",
                    "/sprites/Baraka Complete Edicion/Baraka Caminar/Baraka Caminar_02.png"
                ],
                "Baraka Damage": [
                    "/sprites/Baraka Complete Edicion/Baraka Damage/Baraka Damage_00.png"
                ],
                "Baraka Dead": [
                    "/sprites/Baraka Complete Edicion/Baraka Dead/Baraka Dead_00.png"
                ]
            },
            "Cyrax Complete Edicion": {
                "Cyrax Caminar": [
                    "/sprites/Cyrax Complete Edicion/Cyrax Caminar/Cyrax Caminar_00.png",
                    "/sprites/Cyrax Complete Edicion/Cyrax Caminar/Cyrax Caminar_01.png"
                ],
                "Cyrax Damage": [
                    "/sprites/Cyrax Complete Edicion/Cyrax Damage/Cyrax Damage_00.png"
                ],
                "Cyrax Dead": [
                    "/sprites/Cyrax Complete Edicion/Cyrax Dead/Cyrax Dead_00.png"
                ]
            }
        };
    }

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
                    // No rechazar, usar imagen placeholder
                    resolve(this.createPlaceholderImage());
                };
                
                img.src = url;
            })));
            
            sprites[stateFolder] = imgs;
        }

        console.log(`✅ All sprites loaded for ${characterName}`);
        return sprites;
    }

    createPlaceholderImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('NO IMG', 30, 50);
        
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
}
