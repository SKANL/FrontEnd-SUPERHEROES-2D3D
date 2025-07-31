// visuals.js
// Efectos visuales del login (meteorito, partículas, cristal roto)
import { randomBetween } from './utils.js';

export function createTrailParticles(x, y) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('trail-particle');
        const size = randomBetween(4, 16);
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        const hue = randomBetween(10, 30);
        particle.style.background = `hsla(${hue}, 100%, 60%, ${randomBetween(0.3, 1)})`;
        document.body.appendChild(particle);
        const angle = randomBetween(0, Math.PI * 2);
        const distance = randomBetween(30, 100);
        const duration = randomBetween(0.4, 1);
        const animation = particle.animate([
            { transform: `translate(0, 0) scale(1)`, opacity: 1 },
            { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            easing: 'ease-out'
        });
        animation.onfinish = () => particle.remove();
    }
}

export function createGlowEffect(x, y) {
    const glow = document.createElement('div');
    glow.classList.add('glow');
    glow.style.width = '200px';
    glow.style.height = '200px';
    glow.style.left = `${x - 100}px`;
    glow.style.top = `${y - 100}px`;
    glow.style.background = 'radial-gradient(circle, rgba(255,100,50,0.8) 0%, rgba(255,50,0,0) 70%)';
    glow.style.borderRadius = '50%';
    document.body.appendChild(glow);
    const animation = glow.animate([
        { transform: 'scale(0.5)', opacity: 1 },
        { transform: 'scale(2)', opacity: 0 }
    ], {
        duration: 800,
        easing: 'ease-out'
    });
    animation.onfinish = () => glow.remove();
}

export function createExplosionParticles(x, y) {
    const particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('explosion-particle');
        const size = randomBetween(2, 10);
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        const hue = randomBetween(0, 60);
        particle.style.background = `hsla(${hue}, 100%, 60%, ${randomBetween(0.1, 1)})`;
        particle.style.boxShadow = `0 0 ${size*2}px hsla(${hue}, 100%, 60%, 0.8)`;
        document.body.appendChild(particle);
        const angle = randomBetween(0, Math.PI * 2);
        const distance = randomBetween(100, 300);
        const duration = randomBetween(0.5, 1.5);
        const animation = particle.animate([
            { transform: `translate(0, 0) scale(1)`, opacity: 1 },
            { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        animation.onfinish = () => particle.remove();
    }
}

export function createCrystalFragments(x, y) {
    const fragmentCount = 40;
    for (let i = 0; i < fragmentCount; i++) {
        const fragment = document.createElement('div');
        fragment.classList.add('fragment');
        const width = randomBetween(20, 60);
        const height = randomBetween(20, 60);
        fragment.style.width = `${width}px`;
        fragment.style.height = `${height}px`;
        fragment.style.left = `${x - width/2}px`;
        fragment.style.top = `${y - height/2}px`;
        const points = [];
        const pointCount = Math.floor(randomBetween(5, 9));
        for (let j = 0; j < pointCount; j++) {
            const angle = (j / pointCount) * Math.PI * 2;
            const distance = randomBetween(0.6, 1);
            points.push(`${50 + Math.cos(angle) * distance * 50}% ${50 + Math.sin(angle) * distance * 50}%`);
        }
        fragment.style.clipPath = `polygon(${points.join(', ')})`;
        const hue = randomBetween(180, 240);
        fragment.style.background = `linear-gradient(135deg, hsla(${hue}, 80%, 90%, 0.6), hsla(${hue + 30}, 100%, 70%, 0.3))`;
        fragment.style.boxShadow = `inset 0 0 20px hsla(${hue}, 100%, 100%, 0.5), 0 0 15px hsla(${hue}, 100%, 70%, 0.7)`;
        document.body.appendChild(fragment);
        const angle = randomBetween(0, Math.PI * 2);
        const speed = randomBetween(200, 600);
        const distanceX = Math.cos(angle) * speed;
        const distanceY = Math.sin(angle) * speed - 150;
        const rotation = randomBetween(-540, 540);
        const duration = randomBetween(1, 2.5);
        const zMovement = randomBetween(100, 400);
        const animation = fragment.animate([
            { transform: `translate3d(0, 0, 0) rotate(0deg)`, opacity: 1 },
            { transform: `translate3d(${distanceX}px, ${distanceY}px, ${zMovement}px) rotate(${rotation}deg)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        animation.onfinish = () => fragment.remove();
    }
}

export function createMeteorite(onImpact) {
    const meteorite = document.createElement('div');
    meteorite.style.position = 'absolute';
    meteorite.style.width = '40px';
    meteorite.style.height = '40px';
    meteorite.style.borderRadius = '50%';
    meteorite.style.background = 'radial-gradient(circle, #ff8c00, #ff4500)';
    meteorite.style.boxShadow = '0 0 30px #ff4500, 0 0 60px #ff8c00';
    meteorite.style.zIndex = '3';
    meteorite.style.pointerEvents = 'none';
    meteorite.style.transform = 'translateZ(0)';
    const startX = randomBetween(0, window.innerWidth * 0.4);
    const startY = -100;
    meteorite.style.left = `${startX}px`;
    meteorite.style.top = `${startY}px`;
    document.body.appendChild(meteorite);
    const formRect = document.getElementById('loginContainer').getBoundingClientRect();
    const endX = formRect.left + formRect.width / 2;
    const endY = formRect.top + formRect.height / 2;
    let startTime = null;
    const duration = 1200;
    function animateMeteorite(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 4);
        const currentX = startX + (endX - startX) * easedProgress;
        const currentY = startY + (endY - startY) * easedProgress;
        meteorite.style.left = `${currentX}px`;
        meteorite.style.top = `${currentY}px`;
        if (progress < 0.95) {
            createTrailParticles(currentX, currentY);
        }
        if (progress < 1) {
            requestAnimationFrame(animateMeteorite);
        } else {
            meteorite.remove();
            createGlowEffect(endX, endY);
            createExplosionParticles(endX, endY);
            createCrystalFragments(endX, endY);
            document.body.classList.add('shake');
            setTimeout(() => {
                document.body.classList.remove('shake');
            }, 300);
            if (onImpact) onImpact();
        }
    }
    requestAnimationFrame(animateMeteorite);
}
