// login.js
// Lógica principal de login y efectos visuales
import { createStars, shakeCamera, randomBetween } from './utils.js';
import { login } from './api.js';
import { createTrailParticles, createGlowEffect, createExplosionParticles, createCrystalFragments, createMeteorite } from './visuals.js';

function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.classList.add('show');
}

function hideLoginForm() {
    document.getElementById('loginContainer').style.display = 'none';
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    login(username, password).then(result => {
        if (result.success) {
            createMeteorite(() => {
                hideLoginForm();
                setTimeout(() => showSuccess(result.message), 1000);
            });
        } else {
            shakeCamera();
            alert(result.message);
        }
    });
}

export function initLogin() {
    createStars();
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLoginSubmit);
}

document.addEventListener('DOMContentLoaded', initLogin);
