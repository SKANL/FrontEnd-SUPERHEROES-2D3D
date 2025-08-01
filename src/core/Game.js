// Clase principal del juego
import { ThreeRenderer } from '../render/ThreeRenderer.js';
import { SpriteRenderer } from '../render/SpriteRenderer.js';
import { Fighter } from '../characters/Fighter.js';
import { SpriteLoader } from '../characters/SpriteLoader.js';
import { Controls } from '../input/Controls.js';
import BattleInterface from '../ui/battle/interface.js';

export class Game {
    constructor() {
        this.bgCanvas = document.getElementById('bgCanvas');
        this.spriteCanvas = document.getElementById('spriteCanvas');
        this.ui = document.getElementById('ui');
        this.threeRenderer = new ThreeRenderer(this.bgCanvas);
        this.spriteRenderer = new SpriteRenderer(this.spriteCanvas);
        // Interfaz de batalla
        this.battleUI = new BattleInterface('ui');
        this.fighters = [];
        this.controls = new Controls();
        this.lastTime = performance.now();
        this.roundWins = [0, 0];
        this.roundOver = false;
    }

    async init() {
        await this.threeRenderer.init();
        await this.spriteRenderer.init();
        const loader = new SpriteLoader();

        // Debug: Mostrar personajes disponibles en el manifiesto
        const manifest = await loader.loadManifest();
        console.log("Personajes disponibles en manifest:", Object.keys(manifest));
        
        // Cargar sprites de personajes usando nueva carga dinámica
        console.log("Cargando sprites de Baraka...");
        const player1Sprites = await loader.loadBarakaSprites();
        console.log("Animaciones cargadas para Player 1:", Object.keys(player1Sprites));
        
        // Cargar sprites de player2 (folder debe existir en sprites/)
        console.log("Cargando sprites de Player 2...");
        const player2Sprites = await loader.loadPlayer2Sprites();
        console.log("Animaciones cargadas para Player 2:", Object.keys(player2Sprites));
        
        const canvasWidth = window.innerWidth;
        // Obtener la posición Y del suelo 3D proyectada a pantalla
        const groundWorldY = this.threeRenderer.arena.position.y + 0.3; // 0.3 es la mitad de la altura del suelo
        const groundScreenY = this.threeRenderer.getScreenYFromWorldY(groundWorldY);
        // Proyectar coordenada 3D a 2D (pantalla)
        // Posiciones iniciales para dos luchadores
        const p1x = canvasWidth * 0.3;
        const p2x = canvasWidth * 0.7;
        this.fighters = [
            new Fighter(p1x, groundScreenY, player1Sprites, this.battleUI, 0),
            new Fighter(p2x, groundScreenY, player2Sprites, this.battleUI, 1)
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
        // Actualizar UI de salud y especiales
        this.fighters.forEach((fighter, i) => {
            const hpPercent = (fighter.health / fighter.maxHealth) * 100;
            this.battleUI.updateHealth(i, hpPercent);
            const spPercent = (fighter.special / fighter.maxSpecial) * 100;
            this.battleUI.updateSpecial(i, spPercent);
        });
        this.threeRenderer.render();
        this.spriteRenderer.render(this.fighters);
        // Comprobar fin de round
        if (!this.roundOver) {
            const deadIdx = this.fighters.findIndex(f => f.health === 0);
            if (deadIdx !== -1) {
                this.roundOver = true;
                const winner = 1 - deadIdx;
                this.roundWins[winner]++;
                this.battleUI.updateRoundWins(this.roundWins[0], this.roundWins[1]);
                // Animaciones de final
                this.fighters[winner].setState('winner');
                this.fighters[deadIdx].setState('dead');
                // Deshabilitar controles
                this.controls.disable && this.controls.disable();
                // Reiniciar round tras breve pausa
                setTimeout(() => this.resetRound(), 2000);
            }
        }
        // Evitar superposición de fighters: mantener separación mínima
        const sep = 60; // separación mínima en píxeles
        if (this.fighters.length === 2) {
            const f1 = this.fighters[0];
            const f2 = this.fighters[1];
            const dx = f2.x - f1.x;
            if (Math.abs(dx) < sep) {
                const mid = (f1.x + f2.x) / 2;
                f1.x = mid - sep / 2;
                f2.x = mid + sep / 2;
            }
        }
        requestAnimationFrame(() => this.loop());
    }
}

// Inicialización global
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    window.game.init();
});

// Reiniciar posiciones y estados para nuevo round
Game.prototype.resetRound = function() {
    this.roundOver = false;
    this.battleUI.startTimer(99);
    this.fighters.forEach((f, i) => {
        f.health = f.maxHealth;
        f.special = 0;
        f.comboCount = 0;
        f.setState('idle');
        this.battleUI.updateHealth(i, 100);
        this.battleUI.updateSpecial(i, 0);
        this.battleUI.updateCombo(0);
    });
    if (this.controls.enable) this.controls.enable();
};
