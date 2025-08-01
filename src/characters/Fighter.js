// Clase para luchador y lógica de estados
export class Fighter {
    constructor(x, y, animations, battleUI, playerIndex) {
        this.x = x;
        this.y = y;
        this.animations = animations;
        this.state = 'idle';
        this.frame = 0;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        // UI integration
        this.battleUI = battleUI;
        this.playerIndex = playerIndex;
        // Combo tracking
        this.comboCount = 0;
        // Daño de ataques
        this.attackDamage = { 
            // Ataques básicos
            punching: 10, 
            kicking: 15,
            // Ataques especiales
            specialBlade: 20,
            rayBlade: 25,
            multiBlade: 30,
            grab: 18,
            // Finishers (para demo/testing)
            friendship: 5,
            babality: 5
        };
        this.attackDone = false;
        // Cooldown de ataque (s)
        this.attackCooldown = 1.0;
        this.attackTimer = 0;
        // Dirección visual (true = derecha)
        this.facingRight = true;
        // Special meter
        this.maxSpecial = 100;
        this.special = 0;
        this.scale = 2.2;
        this.speed = 2;
        this.lastUpdate = performance.now();
        // Definir hitboxes relativos por estado (offset y tamaño en porcentaje de sprite)
        this.stateHitboxes = {
            // hitbox más reducido para puñetazo
            punching: { xMul: 0.45, yMul: 0.65, wMul: 0.18, hMul: 0.15 },
            // hitbox más reducido para patada
            kicking:  { xMul: 0.35, yMul: 0.75, wMul: 0.28, hMul: 0.18 },
            // Hitboxes para habilidades especiales
            specialBlade: { xMul: 0.5, yMul: 0.6, wMul: 0.35, hMul: 0.2 },
            rayBlade: { xMul: 0.5, yMul: 0.5, wMul: 0.6, hMul: 0.3 },
            multiBlade: { xMul: 0.4, yMul: 0.4, wMul: 0.5, hMul: 0.5 },
            grab: { xMul: 0.4, yMul: 0.5, wMul: 0.3, hMul: 0.3 }
        };
        // Físicas de salto
        this._velocityY = 0;
        this._gravity = 1200; // px/s^2
        this._jumpStrength = 600; // px/s
        this._jumping = false;
    }
    // Helper para colisión de rectángulos
    intersects(r1, r2) {
        return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x
            && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
    }

    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.frame = 0;
            this.attackDone = false;
        }
    }

    update(delta, opponent) {
        // Actualizar timer de ataque
        if (this.attackTimer > 0) this.attackTimer -= delta;
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

        // IA del oponente (playerIndex 1)
        if (this.playerIndex === 1 && opponent && this.state !== 'dead') {
            const dx = opponent.x - this.x;
            const absdx = Math.abs(dx);
            // Orientación
            this.facingRight = dx > 0;
            // Si fuera del rango de ataque, acercarse
            if (absdx > 120) {
                this._movingLeft = dx < 0;
                this._movingRight = dx > 0;
            } else {
                // Detener movimiento
                this._movingLeft = this._movingRight = false;
                // Intentar atacar si cooldown listo
                if (this.attackTimer <= 0) {
                    const attackType = absdx < 80 ? 'kicking' : 'punching';
                    this.setState(attackType);
                    this.attackTimer = this.attackCooldown;
                }
            }
        }
        // Animación de caminar si se mueve
        if ((this.state === 'idle' || this.state === 'walking') && (this._movingLeft || this._movingRight)) {
            this.setState('walking');
        } else if (this.state === 'walking' && !this._movingLeft && !this._movingRight) {
            this.setState('idle');
        }
        // Lógica de ataque con hitbox preciso basado en sprite
        const attackHitStates = ['punching', 'kicking', 'specialBlade', 'rayBlade', 'multiBlade', 'grab', 
                             'friendship', 'babality'];
        if (attackHitStates.includes(this.state) && opponent) {
            // Ejecutar en frame de impacto (frame variable según el ataque)
            const impactFrame = this.state === 'rayBlade' || this.state === 'multiBlade' ? 3 : 2;
            if (!this.attackDone && this.frame >= (this._animSpeed * impactFrame)) {
                // Obtener sprite actual
                const animArr = this.animations[this.state] || this.animations['idle'];
                const img = animArr[Math.floor(this.frame / this._animSpeed) % animArr.length];
                // Dimensiones escaladas
                const sprW = img.width * this.scale;
                const sprH = img.height * this.scale;
                // Hitbox relativo según estado
                const hb = this.stateHitboxes[this.state] || { xMul:0.4, yMul:0.6, wMul:0.4, hMul:0.4 };
                const atkW = sprW * hb.wMul;
                const atkH = sprH * hb.hMul;
                const xOff = sprW * hb.xMul;
                const yOff = sprH * hb.yMul;
                const atkX = this.x + (this.facingRight ? xOff : -xOff - atkW);
                const atkY = this.y - yOff;
                const attackBox = { x: atkX, y: atkY, width: atkW, height: atkH };
                // Hurtbox del oponente
                const oppArr = opponent.animations[opponent.state] || opponent.animations['idle'] || [];
                if (!oppArr || oppArr.length === 0) {
                    // No hay animación disponible, saltar comprobación de colisión
                    this.attackDone = true;
                    return;
                }
                const oppIdx = Math.floor(opponent.frame / (opponent._animSpeed || this._animSpeed)) % oppArr.length;
                const oppImg = oppArr[oppIdx];
                if (!oppImg) {
                    this.attackDone = true;
                    return;
                }
                const oppW = oppImg.width * opponent.scale * 0.6;
                const oppH = oppImg.height * opponent.scale * 0.9;
                const oppX = opponent.x - oppW / 2;
                const oppY = opponent.y - oppH;
                const oppBox = { x: oppX, y: oppY, width: oppW, height: oppH };
                // Verificar colisión
                if (this.intersects(attackBox, oppBox)) {
                    opponent.takeDamage(this.attackDamage[this.state] || 10);
                }
                this.attackDone = true;
            }
        }
        // Si la animación de ataque ha terminado, volver a idle
        // Lista de estados que deben volver a idle tras completarse
        const attackStates = ['punching', 'kicking', 'specialBlade', 'rayBlade', 'multiBlade', 'grab', 
                             'friendship', 'babality', 'style', 'dizzy'];
        
        if (attackStates.includes(this.state)) {
            const animArr = this.animations[this.state] || [];
            // Comprobación segura para evitar divisiones por cero o accesos a elementos nulos
            const totalCycles = (animArr.length > 0 ? animArr.length : 1) * (this._animSpeed || 24);
            if (this.frame >= totalCycles) {
                this.setState('idle');
            }
        }
    }

    draw(ctx) {
        // Intentar obtener la animación actual, con fallbacks en orden:
        // 1. Estado actual
        // 2. Estado idle
        // 3. Primera animación disponible en el objeto
        let anim = this.animations[this.state];
        if (!anim || anim.length === 0) {
            anim = this.animations['idle'];
            if (!anim || anim.length === 0) {
                // Buscar la primera animación con frames
                for (const key in this.animations) {
                    if (this.animations[key] && this.animations[key].length > 0) {
                        anim = this.animations[key];
                        break;
                    }
                }
            }
        }
        
        if (!anim || anim.length === 0) {
            console.log('No animación para estado:', this.state, 'Animaciones disponibles:', Object.keys(this.animations));
            return;
        }
        
        // Control de velocidad de animación
        if (!this._animFrame) this._animFrame = 2;
        if (!this._animSpeed) this._animSpeed = 24; // Más lento (1 frame cada 12 ciclos)
        
        const imgIndex = Math.floor(this.frame / this._animSpeed) % anim.length;
        const img = anim[imgIndex];
        if (!img || !img.complete) {
            console.log('Imagen no cargada:', img ? img.src : 'undefined');
            return;
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        // Flip horizontal según dirección
        ctx.scale(this.facingRight ? this.scale : -this.scale, this.scale);
        ctx.drawImage(img, -img.width / 2, -img.height);
        ctx.restore();
        this.frame++;
        // Log de depuración para frame y estado
        // console.log(`Draw: estado=${this.state}, frame=${this.frame}, x=${this.x}, y=${this.y}`);
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        // Mostrar daño
        if (this.battleUI) this.battleUI.showDamage(this.playerIndex, amount);
        // Incrementar combo
        this.comboCount++;
        if (this.battleUI) this.battleUI.updateCombo(this.comboCount);
        // Ganancia de special
        this.special = Math.min(this.maxSpecial, this.special + amount * 0.5);
        if (this.battleUI) this.battleUI.updateSpecial(this.playerIndex, (this.special / this.maxSpecial) * 100);
        // Actualizar estado en muerte
        if (this.health === 0) this.setState('dead');
    }

    setMovingLeft(val) {
        this._movingLeft = val;
        // Orientar al jugador hacia la izquierda al moverse
        if (val) this.facingRight = false;
    }
    setMovingRight(val) {
        this._movingRight = val;
        // Orientar al jugador hacia la derecha al moverse
        if (val) this.facingRight = true;
    }
}
