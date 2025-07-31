// Manejo de controles de usuario
export class Controls {
    constructor() {
        this.keys = {};
        this.fighters = [];
    }

    init(fighters) {
        this.fighters = fighters;
        window.addEventListener('keydown', e => this.onKeyDown(e));
        window.addEventListener('keyup', e => this.onKeyUp(e));
    }

    onKeyDown(e) {
        this.keys[e.code] = true;
        // Ejemplo: WASD para player1, Arrow para player2
        if (this.fighters[0]) {
            if (e.code === 'KeyA') this.fighters[0].setMovingLeft(true);
            if (e.code === 'KeyD') this.fighters[0].setMovingRight(true);
            if (e.code === 'KeyW') this.fighters[0].setState('jump');
            if (e.code === 'KeyS') this.fighters[0].setState('defense');
            if (e.code === 'KeyF') this.fighters[0].setState('punching');
            if (e.code === 'KeyG') this.fighters[0].setState('kicking');
            if (e.code === 'KeyV') this.fighters[0].setState('hit');
            if (e.code === 'KeyC') this.fighters[0].setState('pose');
            if (e.code === 'KeyX') this.fighters[0].setState('golpe');
        }
        if (this.fighters[1]) {
            if (e.code === 'ArrowLeft') this.fighters[1].setMovingLeft(true);
            if (e.code === 'ArrowRight') this.fighters[1].setMovingRight(true);
            if (e.code === 'ArrowUp') this.fighters[1].setState('jump');
            if (e.code === 'ArrowDown') this.fighters[1].setState('defense');
            if (e.code === 'Digit1') this.fighters[1].setState('punching');
            if (e.code === 'Digit2') this.fighters[1].setState('kicking');
            if (e.code === 'Digit3') this.fighters[1].setState('hit');
            if (e.code === 'Digit4') this.fighters[1].setState('pose');
        }
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
        // Regresa a idle al soltar teclas de acción
        if (this.fighters[0]) {
            if (e.code === 'KeyA') this.fighters[0].setMovingLeft(false);
            if (e.code === 'KeyD') this.fighters[0].setMovingRight(false);
            if ([
                'KeyW','KeyS','KeyF','KeyG','KeyV','KeyC','KeyX'
            ].includes(e.code)) this.fighters[0].setState('idle');
        }
        if (this.fighters[1]) {
            if (e.code === 'ArrowLeft') this.fighters[1].setMovingLeft(false);
            if (e.code === 'ArrowRight') this.fighters[1].setMovingRight(false);
            if ([
                'ArrowUp','ArrowDown','Digit1','Digit2','Digit3','Digit4'
            ].includes(e.code)) this.fighters[1].setState('idle');
        }
    }
}
