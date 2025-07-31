// utils.js
// Funciones utilitarias para efectos visuales y validaciones

export function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

export function createStars(starCount = 120) {
    const starsContainer = document.getElementById('stars');
    const colors = [
        'rgba(255,255,255,0.95)',
        'rgba(180,220,255,0.85)',
        'rgba(255,220,180,0.8)',
        'rgba(200,255,220,0.8)',
        'rgba(255,180,220,0.8)',
        'rgba(255,255,180,0.7)',
        'rgba(180,255,255,0.7)'
    ];
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const x = randomBetween(0, 100);
        const y = randomBetween(0, 100);
        const size = randomBetween(2, 5.5);
        const duration = randomBetween(2, 7);
        const color = colors[Math.floor(randomBetween(0, colors.length))];
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.background = color;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.boxShadow = `0 0 ${randomBetween(12, 28)}px ${color}, 0 0 32px #ffa502 inset`;
        // Movimiento animado extra
        const moveX = randomBetween(-18, 18);
        const moveY = randomBetween(-18, 18);
        star.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 0.7 },
            { transform: `translate(${moveX}px,${moveY}px) scale(1.12)`, opacity: 1 },
            { transform: 'translate(0,0) scale(1)', opacity: 0.7 }
        ], {
            duration: duration * 1000,
            iterations: Infinity,
            direction: 'alternate',
            easing: 'ease-in-out'
        });
        // Destello ocasional
        setTimeout(() => {
            star.style.boxShadow = `0 0 48px #fff, 0 0 32px #ffa502 inset`;
            setTimeout(() => {
                star.style.boxShadow = `0 0 ${randomBetween(12, 28)}px ${color}, 0 0 32px #ffa502 inset`;
            }, randomBetween(400, 1200));
        }, randomBetween(2000, 6000));
        starsContainer.appendChild(star);
    }
}

export function shakeCamera(duration = 300) {
    document.body.classList.add('shake');
    setTimeout(() => {
        document.body.classList.remove('shake');
    }, duration);
}
