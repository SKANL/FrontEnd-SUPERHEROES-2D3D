// Carga de sprites para luchadores
export class SpriteLoader {
    async loadBarakaSprites() {
        const base = 'sprites/Baraka Complete Edicion';
        const folders = {
            idle: 'Baraka Style',
            walking: 'Baraka Caminar',
            punching: 'Baraka Cuchillas',
            hit: 'Baraka Damage',
            kicking: 'Baraka Patadas',
            jump: 'Baraka Saltar+Girar',
            defense: 'Baraka Defensa',
            dead: 'Baraka Dead',
            winner: 'Baraka Winner',
            pose: 'Baraka Poses',
            golpe: 'Baraka Golpes'
        };
        const files = {
            idle: [
                'Baraka Style_00.png','Baraka Style_01.png','Baraka Style_02.png','Baraka Style_03.png'
            ],
            walking: [
                'Baraka Caminar_00.png','Baraka Caminar_01.png','Baraka Caminar_02.png','Baraka Caminar_03.png','Baraka Caminar_04.png','Baraka Caminar_05.png','Baraka Caminar_06.png','Baraka Caminar_07.png','Baraka Caminar_08.png'
            ],
            punching: [
                'Baraka Cuchillas_00.png','Baraka Cuchillas_01.png','Baraka Cuchillas_02.png','Baraka Cuchillas_03.png','Baraka Cuchillas_04.png','Baraka Cuchillas_05.png','Baraka Cuchillas_06.png','Baraka Cuchillas_07.png','Baraka Cuchillas_08.png','Baraka Cuchillas_09.png','Baraka Cuchillas_010.png','Baraka Cuchillas_011.png','Baraka Cuchillas_012.png','Baraka Cuchillas_013.png'
            ],
            hit: [
                'Baraka Damage_00.png','Baraka Damage_01.png','Baraka Damage_02.png','Baraka Damage_03.png','Baraka Damage_04.png','Baraka Damage_05.png','Baraka Damage_06.png','Baraka Damage_07.png','Baraka Damage_08.png','Baraka Damage_09.png','Baraka Damage_010.png','Baraka Damage_011.png','Baraka Damage_012.png','Baraka Damage_013.png','Baraka Damage_014.png','Baraka Damage_015.png','Baraka Damage_016.png','Baraka Damage_017.png','Baraka Damage_018.png','Baraka Damage_019.png','Baraka Damage_020.png','Baraka Damage_021.png','Baraka Damage_022.png','Baraka Damage_023.png','Baraka Damage_024.png','Baraka Damage_025.png','Baraka Damage_026.png','Baraka Damage_027.png','Baraka Damage_028.png','Baraka Damage_029.png','Baraka Damage_030.png'
            ],
            kicking: [
                'Baraka Patada_00.png','Baraka Patada_01.png','Baraka Patada_02.png','Baraka Patada_03.png','Baraka Patada_04.png','Baraka Patada_05.png','Baraka Patada_06.png','Baraka Patada_07.png','Baraka Patada_08.png','Baraka Patada_09.png','Baraka Patada_010.png','Baraka Patada_011.png','Baraka Patada_012.png','Baraka Patada_013.png','Baraka Patada_014.png','Baraka Patada_015.png','Baraka Patada_016.png','Baraka Patada_017.png','Baraka Patada_018.png','Baraka Patada_019.png','Baraka Patada_020.png','Baraka Patada_021.png','Baraka Patada_022.png','Baraka Patada_023.png','Baraka Patada_024.png','Baraka Patada_025.png','Baraka Patada_026.png','Baraka Patada_027.png','Baraka Patada_028.png','Baraka Patada_029.png','Baraka Patada_030.png','Baraka Patada_031.png'
            ],
            jump: [
                'Baraka Saltar+Girar_00.png','Baraka Saltar+Girar_01.png','Baraka Saltar+Girar_02.png','Baraka Saltar+Girar_03.png','Baraka Saltar+Girar_04.png','Baraka Saltar+Girar_05.png','Baraka Saltar+Girar_06.png','Baraka Saltar+Girar_07.png','Baraka Saltar+Girar_08.png','Baraka Saltar+Girar_09.png','Baraka Saltar+Girar_010.png','Baraka Saltar+Girar_011.png','Baraka Saltar+Girar_012.png','Baraka Saltar+Girar_013.png'
            ],
            defense: [
                'Baraka Defensa_00.png','Baraka Defensa_01.png','Baraka Defensa_02.png','Baraka Defensa_03.png','Baraka Defensa_04.png','Baraka Defensa_05.png'
            ],
            dead: [
                'Baraka Dead_00.png','Baraka Dead_01.png','Baraka Dead_02.png','Baraka Dead_03.png','Baraka Dead_04.png','Baraka Dead_05.png','Baraka Dead_06.png','Baraka Dead_07.png','Baraka Dead_08.png','Baraka Dead_09.png'
            ],
            winner: [
                'Baraka Winner_00.png','Baraka Winner_01.png','Baraka Winner_02.png','Baraka Winner_03.png','Baraka Winner_04.png','Baraka Winner_05.png','Baraka Winner_06.png'
            ],
            pose: [
                'Baraka Pose_00.png','Baraka Pose_01.png','Baraka Pose_02.png'
            ],
            golpe: [
                'Baraka Golpes_00.png','Baraka Golpes_01.png','Baraka Golpes_02.png','Baraka Golpes_03.png','Baraka Golpes_04.png','Baraka Golpes_05.png','Baraka Golpes_06.png','Baraka Golpes_07.png','Baraka Golpes_08.png','Baraka Golpes_09.png'
            ]
        };
        const animations = {};
        for (const [state, folder] of Object.entries(folders)) {
            animations[state] = await this.loadImages(
                folder ? `${base}/${folder}` : base,
                files[state]
            );
        }
        return animations;
    }

    async loadPlayer2Sprites() {
        // Si no existen sprites reales, usa los de Baraka
        try {
            const base = 'sprites/player2';
            const files = ['player2_idle.png'];
            const images = await this.loadImages(base, files);
            // Si la imagen se carga correctamente, úsala
            if (images[0] && images[0].complete && images[0].naturalWidth > 0) {
                return { idle: images };
            }
        } catch (e) {}
        // Si no existe, usa los sprites de Baraka
        return await this.loadBarakaSprites();
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
