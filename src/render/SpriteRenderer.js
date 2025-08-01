// Renderizador de sprites 2D
export class SpriteRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    async init() {
        // No requiere inicialización asíncrona
    }

    render(fighters) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        fighters.forEach(fighter => fighter.draw(this.ctx));
    }
}
