// Clase para luchador y lógica de estados
export class Fighter {
    constructor(x, y, animations, healthBar) {
        this.x = x;
        this.y = y;
        this.animations = animations;
        this.state = 'idle';
        this.frame = 0;
        this.health = 100;
        this.healthBar = healthBar;
        this.scale = 2.2;
        this.speed = 2;
        this.lastUpdate = performance.now();
        // Físicas de salto
        this._velocityY = 0;
        this._gravity = 1200; // px/s^2
        this._jumpStrength = 600; // px/s
        this._jumping = false;
    }

    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.frame = 0;
        }
    }

    update(delta, opponent) {
        // Movimiento horizontal
        if (this.state !== 'defense' && this.state !== 'dead') {
            if (this._movingLeft) {
                this.x -= this.speed;
            }
            if (this._movingRight) {
                this.x += this.speed;
            }
        }

        // Colisión física con los límites laterales del escenario 3D
        let minX = 120;
        let maxX = window.innerWidth - 120;
        if (window.game && window.game.threeRenderer && window.game.threeRenderer.arena) {
            // Obtener ancho de la arena en coordenadas 3D
            const arenaWidth = window.game.threeRenderer.arena.geometry.parameters.width;
            // Proyectar extremos de la arena a pantalla
            const leftWorldX = -arenaWidth / 2;
            const rightWorldX = arenaWidth / 2;
            const leftScreenX = window.game.threeRenderer.getScreenXFromWorldX(leftWorldX);
            const rightScreenX = window.game.threeRenderer.getScreenXFromWorldX(rightWorldX);
            minX = leftScreenX + 40; // margen visual
            maxX = rightScreenX - 40;
        }
        if (this.x < minX) this.x = minX;
        if (this.x > maxX) this.x = maxX;

        // Físicas de salto y caída
        // El suelo se sincroniza con el suelo 3D proyectado a pantalla
        let groundY = window.innerHeight - 80;
        if (window.game && window.game.threeRenderer && window.game.threeRenderer.arena) {
            const groundWorldY = window.game.threeRenderer.arena.position.y + 0.3;
            groundY = window.game.threeRenderer.getScreenYFromWorldY(groundWorldY);
        }
        if (this.state === 'jump') {
            if (!this._jumping) {
                this._jumping = true;
                this._velocityY = -this._jumpStrength;
            }
        }
        if (this._jumping) {
            this._velocityY += this._gravity * delta;
            this.y += this._velocityY * delta;
            if (this.y >= groundY) {
                this.y = groundY;
                this._velocityY = 0;
                this._jumping = false;
                this.setState('idle');
            }
        } else {
            this.y = groundY;
        }

        // Animación de caminar si se mueve
        if ((this.state === 'idle' || this.state === 'walking') && (this._movingLeft || this._movingRight)) {
            this.setState('walking');
        } else if (this.state === 'walking' && !this._movingLeft && !this._movingRight) {
            this.setState('idle');
        }
    }

    draw(ctx) {
        const anim = this.animations[this.state] || this.animations['idle'];
        if (!anim || anim.length === 0) {
            console.log('No animación para estado:', this.state);
            return;
        }
        // Control de velocidad de animación (25% de la actual)
        if (!this._animFrame) this._animFrame = 2;
        if (!this._animSpeed) this._animSpeed = 24; // Más lento (1 frame cada 12 ciclos)
        const img = anim[Math.floor(this.frame / this._animSpeed) % anim.length];
        if (!img.complete) {
            console.log('Imagen no cargada:', img.src);
            return;
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.drawImage(img, -img.width / 2, -img.height);
        ctx.restore();
        this.frame++;
        // Log de depuración para frame y estado
        // console.log(`Draw: estado=${this.state}, frame=${this.frame}, x=${this.x}, y=${this.y}`);
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.healthBar.set(this.health);
        if (this.health === 0) this.setState('dead');
    }

    setMovingLeft(val) { this._movingLeft = val; }
    setMovingRight(val) { this._movingRight = val; }
}
