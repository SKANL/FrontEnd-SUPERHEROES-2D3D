// Clase principal del juego
import { ThreeRenderer } from '../render/ThreeRenderer.js';
import { SpriteRenderer } from '../render/SpriteRenderer.js';
import { Fighter } from '../characters/Fighter.js';
import { SpriteLoader } from '../characters/SpriteLoader.js';
import { Controls } from '../input/Controls.js';
import { HealthBar } from '../ui/HealthBar.js';

export class Game {
    constructor() {
        this.bgCanvas = document.getElementById('bgCanvas');
        this.spriteCanvas = document.getElementById('spriteCanvas');
        this.ui = document.getElementById('ui');
        this.threeRenderer = new ThreeRenderer(this.bgCanvas);
        this.spriteRenderer = new SpriteRenderer(this.spriteCanvas);
        this.player1Bar = new HealthBar(document.getElementById('player1Bar'));
        this.player2Bar = new HealthBar(document.getElementById('player2Bar'));
        this.fighters = [];
        this.controls = new Controls();
        this.lastTime = performance.now();
    }

    async init() {
        await this.threeRenderer.init();
        await this.spriteRenderer.init();
        const loader = new SpriteLoader();
        const player1Sprites = await loader.loadBarakaSprites();
        // Centrar luchador horizontalmente y colocarlo en el suelo 3D
        const canvasWidth = window.innerWidth;
        // Obtener la posición Y del suelo 3D proyectada a pantalla
        const groundWorldY = this.threeRenderer.arena.position.y + 0.3; // 0.3 es la mitad de la altura del suelo
        // Proyectar coordenada 3D a 2D (pantalla)
        const groundScreenY = this.threeRenderer.getScreenYFromWorldY(groundWorldY);
        this.fighters = [
            new Fighter(canvasWidth * 0.5, groundScreenY, player1Sprites, this.player1Bar)
        ];
        this.controls.init(this.fighters);
        this.loop();
    }

    loop() {
        const now = performance.now();
        const delta = (now - this.lastTime) / 1000;
        this.lastTime = now;
        // Actualizar lógica de los luchadores
        this.fighters.forEach((fighter, i) => {
            const opponent = this.fighters[1 - i];
            fighter.update(delta, opponent);
        });
        this.threeRenderer.render();
        this.spriteRenderer.render(this.fighters);
        requestAnimationFrame(() => this.loop());
    }
}

// Inicialización global
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    window.game.init();
});
