// register.js
import { createStars, shakeCamera, randomBetween } from '../auth/utils.js';
import { register } from '../auth/api.js';

function createPortalEnergyAbsorb(formEl, onFinish) {
    const rect = formEl.getBoundingClientRect();
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    // Portal en el centro del viewport
    const portal = document.createElement('div');
    portal.classList.add('portal-energy');
    portal.style.position = "fixed";
    portal.style.width = "220px";
    portal.style.height = "220px";
    portal.style.left = `${viewportCenterX}px`;
    portal.style.top = `${viewportCenterY}px`;
    portal.style.transform = 'translate(-50%, -50%) scale(0.7)';
    portal.style.background = 'radial-gradient(circle, #00eaff 0%, #6ec6ff 60%, transparent 100%)';
    portal.style.boxShadow = '0 0 80px 40px #00eaff, 0 0 120px 60px #6ec6ff';
    portal.style.filter = 'blur(2px) brightness(1.2)';
    portal.style.opacity = '0.85';
    portal.style.zIndex = '20';
    portal.style.borderRadius = '50%';
    document.body.appendChild(portal);
    // Animación mejorada: absorción energética, partículas, destello y vibración
    formEl.style.position = 'fixed';
    formEl.style.margin = '0';
    formEl.style.left = `${viewportCenterX}px`;
    formEl.style.top = `${viewportCenterY}px`;
    formEl.style.transform = 'translate(-50%, -50%) scale(1)';
    formEl.style.transition = 'transform 0.9s cubic-bezier(.77,-0.6,.2,1.5), opacity 0.9s';
    formEl.style.zIndex = '21';
    // Efecto de vibración inicial
    formEl.classList.add('shake');
    setTimeout(() => {
        formEl.classList.remove('shake');
        // Achica y desvanece el formulario en el centro, con destello
        formEl.style.boxShadow = '0 0 60px 20px #00eaff88';
        formEl.style.transform = 'translate(-50%, -50%) scale(0.12)';
        formEl.style.opacity = '0';
        // Partículas luminosas y fragmentos de cristal
        const x = viewportCenterX;
        const y = viewportCenterY;
        createLightParticlesSpiral(x, y);
        createCrystalFragmentsUp(x, y);
        // Destello energético
        const glow = document.createElement('div');
        glow.classList.add('glow');
        glow.style.position = 'fixed';
        glow.style.left = `${x - 110}px`;
        glow.style.top = `${y - 110}px`;
        glow.style.width = '220px';
        glow.style.height = '220px';
        glow.style.background = 'radial-gradient(circle, #00eaff88 0%, #6ec6ff44 60%, transparent 100%)';
        glow.style.borderRadius = '50%';
        glow.style.zIndex = '22';
        document.body.appendChild(glow);
        glow.animate([
            { transform: 'scale(0.7)', opacity: 0.7 },
            { transform: 'scale(1.5)', opacity: 0.2 }
        ], {
            duration: 700,
            easing: 'cubic-bezier(.77,.2,.32,1.01)'
        }).onfinish = () => glow.remove();
        // Vibración de pantalla
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 400);
    }, 80);
    // Portal animación
    portal.animate([
        { transform: 'translate(-50%, -50%) scale(0.7)', opacity: 0.85 },
        { transform: 'translate(-50%, -50%) scale(1.3)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(1.7)', opacity: 0 }
    ], {
        duration: 900,
        easing: 'cubic-bezier(.77,.2,.32,1.01)'
    }).onfinish = () => {
        portal.remove();
        formEl.style.display = 'none';
        if (onFinish) onFinish();
    };
}

function createLightParticlesSpiral(x, y) {
    for (let i = 0; i < 36; i++) {
        const particle = document.createElement('div');
        particle.classList.add('light-particle');
        const size = randomBetween(10, 24);
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        document.body.appendChild(particle);
        // Espiral animada
        const angle = i * (Math.PI * 2 / 36) + randomBetween(-0.2, 0.2);
        const spiralRadius = randomBetween(120, 220);
        const spiralTurns = randomBetween(1.2, 2.2);
        const duration = randomBetween(1.1, 1.7);
        const animation = particle.animate([
            { transform: `translate(0, 0) scale(1)`, opacity: 1 },
            { transform: `translate(${Math.cos(angle) * spiralRadius * spiralTurns}px, ${Math.sin(angle) * spiralRadius * spiralTurns}px) scale(0.5)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(.77,.2,.32,1.01)'
        });
        animation.onfinish = () => particle.remove();
    }
}

function createCrystalFragmentsUp(x, y) {
    for (let i = 0; i < 28; i++) {
        const fragment = document.createElement('div');
        fragment.classList.add('crystal-fragment');
        const width = randomBetween(18, 38);
        const height = randomBetween(18, 38);
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
        const hue = randomBetween(180, 210);
        fragment.style.background = `linear-gradient(135deg, hsla(${hue}, 80%, 90%, 0.7), hsla(${hue + 30}, 100%, 70%, 0.4))`;
        fragment.style.boxShadow = `inset 0 0 18px hsla(${hue}, 100%, 100%, 0.5), 0 0 12px hsla(${hue}, 100%, 70%, 0.7)`;
        document.body.appendChild(fragment);
        // Trayectoria ascendente y rotación
        const angle = randomBetween(-Math.PI/2 - 0.7, -Math.PI/2 + 0.7);
        const speed = randomBetween(120, 320);
        const distanceX = Math.cos(angle) * speed;
        const distanceY = Math.sin(angle) * speed - randomBetween(80, 180);
        const rotation = randomBetween(-360, 360);
        const duration = randomBetween(1.1, 1.7);
        const zMovement = randomBetween(60, 180);
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

function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.classList.add('show');
}

function hideRegisterForm() {
    document.getElementById('registerContainer').style.display = 'none';
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value || 'user';
    const formEl = document.getElementById('registerContainer');
    register(username, email, password, role).then(result => {
        if (result.success) {
            // Portal animado con absorción
            createPortalEnergyAbsorb(formEl, () => {
                const formRect = formEl.getBoundingClientRect();
                const x = formRect.left + formRect.width / 2;
                const y = formRect.top + formRect.height / 2;
                createLightParticlesSpiral(x, y);
                createCrystalFragmentsUp(x, y);
                hideRegisterForm();
                setTimeout(() => showSuccess(result.message), 900);
            });
        } else {
            shakeCamera();
            alert(result.message);
        }
    });
}

export function initRegister() {
    createStars();
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', handleRegisterSubmit);
}

document.addEventListener('DOMContentLoaded', initRegister);
