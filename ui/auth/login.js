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
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    login(email, password).then(result => {
        if (result.success) {
            createMeteorite(() => {
                hideLoginForm();
                setTimeout(() => {
                    showSuccess(result.message);
                    setTimeout(() => {
                        // Redirigir al dashboard después del login exitoso
                        window.location.href = '../dashboard/index.html';
                    }, 1500);
                }, 1000);
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
    
    // Agregar navegación al registro
    const showRegisterLink = document.getElementById('showRegister');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '../register/index.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', initLogin);
