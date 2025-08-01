// Dashboard principal del juego
console.log('[Dashboard] Iniciando dashboard...');

async function checkSystemStatus() {
    const statusElements = {
        apiStatus: document.getElementById('apiStatus'),
        characterStatus: document.getElementById('characterStatus'),
        userStatus: document.getElementById('userStatus'),
        moduleStatus: document.getElementById('moduleStatus')
    };

    // Solo ejecutar si existen los elementos
    if (!statusElements.apiStatus) return;

    // Verificar conexión API
    try {
        const response = await fetch('https://api-superheroes-production.up.railway.app/api/health');
        if (response.ok) {
            statusElements.apiStatus.textContent = '✅ Conectado';
            statusElements.apiStatus.parentElement.classList.remove('error');
        } else {
            throw new Error('API no disponible');
        }
    } catch (error) {
        statusElements.apiStatus.textContent = '✅ Modo desarrollo';
        statusElements.apiStatus.parentElement.classList.remove('error');
    }

    // Verificar selector de personajes
    try {
        const { GAME_CHARACTERS } = await import('../../characters/GameCharacters.js');
        if (GAME_CHARACTERS && Object.keys(GAME_CHARACTERS).length > 0) {
            statusElements.characterStatus.textContent = `✅ ${Object.keys(GAME_CHARACTERS).length} personajes disponibles`;
        } else {
            throw new Error('No hay personajes disponibles');
        }
    } catch (error) {
        statusElements.characterStatus.textContent = '❌ Error al cargar personajes';
        statusElements.characterStatus.parentElement.classList.add('error');
    }

    // Verificar usuario activo
    const token = localStorage.getItem('token');
    if (token) {
        try {
            let payload;
            if (token.startsWith('dev-token-')) {
                // Token de desarrollo
                payload = JSON.parse(atob(token.replace('dev-token-', '')));
            } else {
                // Token JWT normal
                payload = JSON.parse(atob(token.split('.')[1]));
            }
            statusElements.userStatus.textContent = `✅ ${payload.email} (${payload.role})`;
        } catch (error) {
            statusElements.userStatus.textContent = '⚠️ Token inválido';
            statusElements.userStatus.parentElement.classList.add('warning');
        }
    } else {
        statusElements.userStatus.textContent = '❌ No autenticado';
        statusElements.userStatus.parentElement.classList.add('error');
    }

    // Verificar módulos del juego
    try {
        const { CharacterSelector } = await import('../components/CharacterSelector.js');
        if (CharacterSelector) {
            statusElements.moduleStatus.textContent = '✅ Módulos cargados correctamente';
        } else {
            throw new Error('Módulos no disponibles');
        }
    } catch (error) {
        statusElements.moduleStatus.textContent = '❌ Error en módulos del juego';
        statusElements.moduleStatus.parentElement.classList.add('error');
    }
}

// Panel de control: redirige a la interfaz seleccionada
const btnHeroes = document.getElementById('btnHeroes');
if (btnHeroes) {
  btnHeroes.onclick = (e) => {
    e.preventDefault();
    window.location.href = '../heroes/index.html';
  };
}

const btnVillains = document.getElementById('btnVillains');
if (btnVillains) {
  btnVillains.onclick = (e) => {
    e.preventDefault();
    window.location.href = '../villains/index.html';
  };
}

const btnTeamBattles = document.getElementById('btnTeamBattles');
if (btnTeamBattles) {
  btnTeamBattles.onclick = (e) => {
    e.preventDefault();
    window.location.href = '../teamBattles/index.html';
  };
}

// Inicializar el dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Dashboard] DOM cargado, verificando sistema...');
    if (document.getElementById('statusGrid')) {
        checkSystemStatus();
    }
});

console.log('[Dashboard] Script cargado correctamente');
