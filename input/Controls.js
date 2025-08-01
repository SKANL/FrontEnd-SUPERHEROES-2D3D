// Manejo de controles de usuario
export class Controls {
    constructor() {
        this.keys = {};
        this.fighters = [];
        // bound event handlers for enable/disable
        this.keyDownHandler = this.onKeyDown.bind(this);
        this.keyUpHandler = this.onKeyUp.bind(this);
    }

    init(fighters) {
        this.fighters = fighters;
        this.enable();
    }

    disable() {
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
    }

    enable() {
        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);
    }

    onKeyDown(e) {
        this.keys[e.code] = true;
        // Jugador 1: WASD movimiento + teclas especiales
        if (this.fighters[0]) {
            // Movimiento básico
            if (e.code === 'KeyA') this.fighters[0].setMovingLeft(true);
            if (e.code === 'KeyD') this.fighters[0].setMovingRight(true);
            if (e.code === 'KeyW') this.fighters[0].setState('jump');
            if (e.code === 'KeyS') this.fighters[0].setState('defense');
            
            // Ataques básicos
            if (e.code === 'KeyF') this.fighters[0].setState('punching');
            if (e.code === 'KeyG') this.fighters[0].setState('kicking');
            
            // Habilidades especiales mapeadas desde animaciones disponibles
            if (e.code === 'KeyE') this.fighters[0].setState('specialBlade'); // Cuchillas
            if (e.code === 'KeyR') this.fighters[0].setState('rayBlade');  // Rayo Cuchilla
            if (e.code === 'KeyT') this.fighters[0].setState('multiBlade'); // Multi Cuchilla
            if (e.code === 'KeyQ') this.fighters[0].setState('grab');      // Agarrar+Lanzar
            
            // Poses y finishers
            if (e.code === 'KeyZ') this.fighters[0].setState('friendship'); // Freinship
            if (e.code === 'KeyX') this.fighters[0].setState('babality');  // Babality
            if (e.code === 'KeyC') this.fighters[0].setState('style');     // Style
            if (e.code === 'KeyV') this.fighters[0].setState('winner');    // Pose ganadora
            if (e.code === 'KeyB') this.fighters[0].setState('dizzy');     // Mariado
        }
        
        // Jugador 2: Flechas + teclas numéricas
        if (this.fighters[1]) {
            // Movimiento básico
            if (e.code === 'ArrowLeft') this.fighters[1].setMovingLeft(true);
            if (e.code === 'ArrowRight') this.fighters[1].setMovingRight(true);
            if (e.code === 'ArrowUp') this.fighters[1].setState('jump');
            if (e.code === 'ArrowDown') this.fighters[1].setState('defense');
            
            // Ataques básicos
            if (e.code === 'Digit1') this.fighters[1].setState('punching');
            if (e.code === 'Digit2') this.fighters[1].setState('kicking');
            
            // Habilidades especiales
            if (e.code === 'Digit3') this.fighters[1].setState('specialBlade'); // Cuchillas
            if (e.code === 'Digit4') this.fighters[1].setState('rayBlade');  // Rayo Cuchilla
            if (e.code === 'Digit5') this.fighters[1].setState('multiBlade'); // Multi Cuchilla
            if (e.code === 'Digit0') this.fighters[1].setState('grab');      // Agarrar+Lanzar
            
            // Poses y finishers
            if (e.code === 'Numpad1') this.fighters[1].setState('friendship'); 
            if (e.code === 'Numpad2') this.fighters[1].setState('babality');
            if (e.code === 'Numpad3') this.fighters[1].setState('style');
            if (e.code === 'Numpad0') this.fighters[1].setState('winner');
            if (e.code === 'NumpadDecimal') this.fighters[1].setState('dizzy');
        }
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
        // Manejo de liberación de teclas para Jugador 1
        if (this.fighters[0]) {
            // Movimiento
            if (e.code === 'KeyA') this.fighters[0].setMovingLeft(false);
            if (e.code === 'KeyD') this.fighters[0].setMovingRight(false);
            
            // Solo interrumpimos estas acciones, las demás deben completar animación
            const interruptibleActions = ['KeyW', 'KeyS'];
            if (interruptibleActions.includes(e.code)) {
                this.fighters[0].setState('idle');
            }
        }
        
        // Manejo de liberación de teclas para Jugador 2
        if (this.fighters[1]) {
            // Movimiento
            if (e.code === 'ArrowLeft') this.fighters[1].setMovingLeft(false);
            if (e.code === 'ArrowRight') this.fighters[1].setMovingRight(false);
            
            // Solo interrumpimos estas acciones, las demás deben completar animación
            const interruptibleActions = ['ArrowUp', 'ArrowDown'];
            if (interruptibleActions.includes(e.code)) {
                this.fighters[1].setState('idle');
            }
        }
    }
}
