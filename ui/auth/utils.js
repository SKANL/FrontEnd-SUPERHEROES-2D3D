// Mostrar mensaje de error en pantalla
export function showError(message) {
    let errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.right = '20px';
        errorDiv.style.background = '#ff5252';
        errorDiv.style.color = '#fff';
        errorDiv.style.padding = '0.7rem 1.5rem';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.zIndex = '9999';
        errorDiv.style.fontWeight = 'bold';
        document.body.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => { errorDiv.style.display = 'none'; }, 3500);
}

// Mostrar mensaje de éxito en pantalla
export function showSuccess(message) {
    let successDiv = document.getElementById('successMessage');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'successMessage';
        successDiv.style.position = 'fixed';
        successDiv.style.top = '20px';
        successDiv.style.right = '20px';
        successDiv.style.background = '#ffb300';
        successDiv.style.color = '#23283b';
        successDiv.style.padding = '0.7rem 1.5rem';
        successDiv.style.borderRadius = '8px';
        successDiv.style.zIndex = '9999';
        successDiv.style.fontWeight = 'bold';
        document.body.appendChild(successDiv);
    }
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => { successDiv.style.display = 'none'; }, 3500);
}
// Cerrar sesión: elimina el token y redirige al login
export function logout() {
    localStorage.removeItem('token');
    window.location.href = '../auth/index.html';
}
// Extraer el rol del token JWT
// Obtiene el rol del usuario desde el JWT o, si no está, desde el endpoint /auth/me
export async function getUserRoleFromTokenAsync() {
    try {
        const token = getToken();
        if (!token) {
            console.warn('No token found for role recovery');
            return 'usuario';
        }
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role) {
            return payload.role;
        }
        // Si el rol no está en el token, consulta el endpoint /auth/me
        const res = await fetch('https://api-superheroes-production.up.railway.app/auth/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) {
            console.warn('No se pudo recuperar el rol desde /auth/me:', res.status);
            return 'usuario';
        }
        const data = await res.json();
        if (data && data.role) {
            return data.role;
        } else {
            console.warn('Respuesta de /auth/me sin rol:', data);
            return 'usuario';
        }
    } catch (e) {
        console.error('Error recuperando el rol:', e);
        return 'usuario';
    }
}
// Obtener el token JWT almacenado en localStorage
export function getToken() {
    return localStorage.getItem('token') || '';
}

// Extraer el userId del token JWT
export function getUserIdFromToken() {
    try {
        const token = getToken();
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || payload._id || payload.userId || null;
    } catch {
        return null;
    }
}

// Extraer el rol del token JWT
export function isAdmin() {
    try {
        const token = getToken();
        if (!token) return false;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role === 'admin';
    } catch {
        return false;
    }
}
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
