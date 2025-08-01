// Archivo principal para iniciar el juego con integración de API
import { TeamBattleGame } from './battleIntegration.js';
import { ApiControls } from '../../input/ApiControls.js';
import { getTeamBattleById, selectSide, getBattleState } from './teamBattleApi.js';
import { getToken } from '../auth/utils.js';
import { getHeroById } from '../heroes/heroApi.js';
import { getVillainById } from '../villains/villainApi.js';

// Hacer ApiControls disponible globalmente
window.ApiControls = ApiControls;

// Función para cargar datos completos de personajes basándose en IDs
async function loadCharacterData(battleData, token) {
    console.log('=== CARGANDO DATOS COMPLETOS DE PERSONAJES ===');
    
    let heroes = [];
    let villains = [];
    
    try {
        // Si battleData tiene arrays de objetos completos, usarlos directamente
        if (battleData.heroes && Array.isArray(battleData.heroes) && 
            battleData.heroes.length > 0 && battleData.heroes[0] && 
            typeof battleData.heroes[0] === 'object' && battleData.heroes[0].id) {
            console.log('Usando datos de héroes completos de la batalla');
            heroes = battleData.heroes;
        } 
        // Si tiene heroIds, cargar los datos completos
        else if (battleData.heroIds && Array.isArray(battleData.heroIds) && battleData.heroIds.length > 0) {
            console.log('Cargando datos completos de héroes por IDs:', battleData.heroIds);
            for (const heroId of battleData.heroIds) {
                try {
                    const heroData = await getHeroById(heroId);
                    if (heroData && heroData.id) {
                        heroes.push(heroData);
                    }
                } catch (error) {
                    console.error(`Error cargando héroe ${heroId}:`, error);
                }
            }
        }
        // Si battleData.heroes existe pero no es válido, crear datos simulados
        else if (battleData.heroes && !Array.isArray(battleData.heroes)) {
            console.warn('battleData.heroes no es un array, creando datos simulados');
            heroes = [{ id: 'hero-1', name: 'Héroe Simulado', health: 100, power: 50 }];
        }
        
        // Misma lógica para villanos
        if (battleData.villains && Array.isArray(battleData.villains) && 
            battleData.villains.length > 0 && battleData.villains[0] &&
            typeof battleData.villains[0] === 'object' && battleData.villains[0].id) {
            console.log('Usando datos de villanos completos de la batalla');
            villains = battleData.villains;
        }
        else if (battleData.villainIds && Array.isArray(battleData.villainIds) && battleData.villainIds.length > 0) {
            console.log('Cargando datos completos de villanos por IDs:', battleData.villainIds);
            for (const villainId of battleData.villainIds) {
                try {
                    const villainData = await getVillainById(villainId);
                    if (villainData && villainData.id) {
                        villains.push(villainData);
                    }
                } catch (error) {
                    console.error(`Error cargando villano ${villainId}:`, error);
                }
            }
        }
        // Si battleData.villains existe pero no es válido, crear datos simulados
        else if (battleData.villains && !Array.isArray(battleData.villains)) {
            console.warn('battleData.villains no es un array, creando datos simulados');
            villains = [{ id: 'villain-1', name: 'Villano Simulado', health: 100, power: 50 }];
        }
        
        // Si no tenemos datos suficientes, crear personajes por defecto
        if (heroes.length === 0) {
            console.warn('No se encontraron héroes, creando héroe por defecto');
            heroes = [{ id: 'default-hero', name: 'Héroe por Defecto', health: 100, power: 50 }];
        }
        
        if (villains.length === 0) {
            console.warn('No se encontraron villanos, creando villano por defecto');
            villains = [{ id: 'default-villain', name: 'Villano por Defecto', health: 100, power: 50 }];
        }
        
    } catch (error) {
        console.error('Error en loadCharacterData:', error);
        // Crear datos por defecto en caso de error completo
        heroes = [{ id: 'fallback-hero', name: 'Héroe de Emergencia', health: 100, power: 50 }];
        villains = [{ id: 'fallback-villain', name: 'Villano de Emergencia', health: 100, power: 50 }];
    }
    
    console.log('Datos finales cargados:');
    console.log('- Heroes:', heroes);
    console.log('- Villains:', villains);
    
    return { heroes, villains };
}

// Recuperar ID de batalla y token de autenticación
const params = new URLSearchParams(window.location.search);
const battleId = params.get('battleId');
const token = getToken();

console.log('Iniciando batalla con ID:', battleId);
console.log('Token disponible:', !!token);

if (!battleId || !token) {
    console.error('Falta ID de batalla o token de autenticación');
    alert('Error: No se puede iniciar la batalla. Falta ID de batalla o token de autenticación.');
    // Redirigir a la lista de batallas si no hay ID de batalla o token
    window.location.href = './index.html';
}

// Obtener y configurar el juego
async function initTeamBattleGame() {
    try {
        console.log('=== INICIO INICIALIZACIÓN DEL JUEGO ===');
        
        // Mostrar loader mientras se carga
        showLoader('Cargando batalla...');
        updateLoadingMessage('Obteniendo datos de la batalla...');
        
        // Obtener datos de la batalla
        const battleData = await getTeamBattleById(battleId, token);
        console.log('Datos de batalla obtenidos:', battleData);
        
        // Verificar que la batalla existe y está activa
        if (!battleData) {
            throw new Error('No se pudieron obtener los datos de la batalla');
        }
        
        if (battleData.status === 'finished') {
            showError('La batalla ya ha finalizado');
            setTimeout(() => {
                window.location.href = './index.html';
            }, 2000);
            return;
        }
        
        // Verificar que hay personajes disponibles
        if (!battleData.heroes || !battleData.villains || 
            battleData.heroes.length === 0 || battleData.villains.length === 0) {
            throw new Error('La batalla no tiene personajes válidos');
        }
        
        updateLoadingMessage('Actualizando información de la batalla...');
        // Actualizar información de la batalla en la UI
        updateBattleInfo(battleData);
        
        updateLoadingMessage('Configurando lado del jugador...');
        // Seleccionar lado si no se ha hecho ya
        let side = battleData.playerSide;
        
        if (!side) {
            hideLoader(); // Ocultar loader temporalmente para la selección
            side = await promptForSide();
            showLoader('Continuando inicialización...');
        }
        
        // Si aún no hay un lado seleccionado, usar uno por defecto
        if (!side) {
            console.log('Usando lado por defecto: hero');
            side = 'hero';
        }
        
        console.log('Lado del jugador:', side);
        
        updateLoadingMessage('Cargando datos de personajes...');
        
        // Debug: Verificar estructura de datos de la batalla
        console.log('=== ESTRUCTURA DE DATOS DE BATALLA ===');
        console.log('Battle Data completo:', battleData);
        console.log('Battle Data keys:', Object.keys(battleData));
        console.log('Heroes en battleData:', battleData.heroes);
        console.log('Villains en battleData:', battleData.villains);
        console.log('HeroIds en battleData:', battleData.heroIds);
        console.log('VillainIds en battleData:', battleData.villainIds);
        
        // Cargar datos completos de personajes
        const { heroes, villains } = await loadCharacterData(battleData, token);
        
        // Verificar que tenemos personajes válidos
        if (!heroes || heroes.length === 0) {
            throw new Error('No se pudieron cargar los datos de los héroes');
        }
        
        if (!villains || villains.length === 0) {
            throw new Error('No se pudieron cargar los datos de los villanos');
        }
        
        updateLoadingMessage('Creando instancia del juego...');
        
        // Crear instancia del juego con los datos completos de personajes
        const game = new TeamBattleGame(battleId, heroes, villains);
        
        // Establecer el lado del jugador ANTES de inicializar
        game.playerSide = side;
        
        updateLoadingMessage('Inicializando juego...');
        // Inicializar el juego
        await game.init();
        
        updateLoadingMessage('Configurando controles...');
        // Configurar controles API después de la inicialización
        if (window.ApiControls) {
            const apiControls = new window.ApiControls(game);
            apiControls.init(game.fighters);
            game.apiControls = apiControls;
        } else {
            console.warn('ApiControls no está disponible, usando controles estándar');
        }
        
        updateLoadingMessage('Finalizando...');
        // Ocultar loader
        hideLoader();
        
        // Configurar botones de la interfaz
        setupInterface(game);
        
        console.log('=== JUEGO INICIALIZADO EXITOSAMENTE ===');
        
        // Devolver la instancia del juego
        return game;
    } catch (error) {
        console.error('Error inicializando el juego:', error);
        hideLoader();
        showError('Error cargando la batalla: ' + (error.message || 'Error desconocido'));
        
        // Redirigir a la lista después de mostrar el error
        setTimeout(() => {
            window.location.href = './index.html';
        }, 3000);
        
        return null;
    }
}

// Función para solicitar al usuario que elija un lado
function promptForSide() {
    return new Promise((resolve) => {
        console.log('Solicitando selección de bando al usuario...');
        
        const sideSelector = document.createElement('div');
        sideSelector.className = 'side-selector';
        sideSelector.innerHTML = `
            <div class="side-selector-content">
                <h2>Elige tu bando</h2>
                <p>Selecciona qué personajes quieres controlar en esta batalla</p>
                <div class="side-buttons">
                    <button id="chooseHero">Jugar con Héroes</button>
                    <button id="chooseVillain">Jugar con Villanos</button>
                </div>
            </div>
        `;
        document.body.appendChild(sideSelector);
        
        // Estilos inline para el selector
        sideSelector.style.position = 'fixed';
        sideSelector.style.top = '0';
        sideSelector.style.left = '0';
        sideSelector.style.width = '100%';
        sideSelector.style.height = '100%';
        sideSelector.style.backgroundColor = 'rgba(0,0,0,0.8)';
        sideSelector.style.display = 'flex';
        sideSelector.style.justifyContent = 'center';
        sideSelector.style.alignItems = 'center';
        sideSelector.style.zIndex = '1000';
        
        const content = sideSelector.querySelector('.side-selector-content');
        content.style.backgroundColor = '#222';
        content.style.padding = '30px';
        content.style.borderRadius = '10px';
        content.style.textAlign = 'center';
        content.style.color = 'white';
        content.style.maxWidth = '500px';
        
        // Agregar un párrafo de explicación
        const paragraph = content.querySelector('p');
        paragraph.style.margin = '10px 0 20px';
        paragraph.style.fontSize = '16px';
        paragraph.style.color = '#ddd';
        
        const buttons = sideSelector.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.padding = '15px 30px';
            btn.style.margin = '10px';
            btn.style.fontSize = '18px';
            btn.style.cursor = 'pointer';
            btn.style.borderRadius = '5px';
            btn.style.border = 'none';
            btn.style.fontWeight = 'bold';
            btn.style.width = '80%';
            btn.style.maxWidth = '300px';
        });
        
        const heroBtn = document.getElementById('chooseHero');
        heroBtn.style.backgroundColor = '#4CAF50';
        heroBtn.style.boxShadow = '0 4px 8px rgba(76, 175, 80, 0.3)';
        
        const villainBtn = document.getElementById('chooseVillain');
        villainBtn.style.backgroundColor = '#f44336';
        villainBtn.style.boxShadow = '0 4px 8px rgba(244, 67, 54, 0.3)';
        
        // Eventos para seleccionar lado
        heroBtn.addEventListener('click', async () => {
            console.log('Usuario seleccionó bando: héroes');
            try {
                heroBtn.disabled = true;
                heroBtn.textContent = 'Seleccionando...';
                
                await selectSide(battleId, 'hero', token);
                console.log('Bando de héroe seleccionado exitosamente en la API');
                
                sideSelector.remove();
                resolve('hero');
            } catch (error) {
                console.error('Error seleccionando héroe:', error);
                showError('Error seleccionando bando: ' + (error.message || 'Error desconocido'));
                
                // Habilitar botón nuevamente
                heroBtn.disabled = false;
                heroBtn.textContent = 'Jugar con Héroes';
                
                // Resolver con un valor por defecto para evitar que se rompa
                resolve('hero');
            }
        });
        
        villainBtn.addEventListener('click', async () => {
            console.log('Usuario seleccionó bando: villanos');
            try {
                villainBtn.disabled = true;
                villainBtn.textContent = 'Seleccionando...';
                
                await selectSide(battleId, 'villain', token);
                console.log('Bando de villano seleccionado exitosamente en la API');
                
                sideSelector.remove();
                resolve('villain');
            } catch (error) {
                console.error('Error seleccionando villano:', error);
                showError('Error seleccionando bando: ' + (error.message || 'Error desconocido'));
                
                // Habilitar botón nuevamente
                villainBtn.disabled = false;
                villainBtn.textContent = 'Jugar con Villanos';
                
                // Resolver con un valor por defecto para evitar que se rompa
                resolve('villain');
            }
        });
    });
}

// Actualizar información de la batalla en la UI
function updateBattleInfo(battleData) {
    const battleInfo = document.getElementById('battleInfo');
    if (!battleInfo) return;
    
    // Formatear nombres de personajes
    const heroNames = battleData.heroes.map(h => h.name || h.alias || 'Héroe').join(', ');
    const villainNames = battleData.villains.map(v => v.name || v.alias || 'Villano').join(', ');
    
    battleInfo.innerHTML = `
        <div><strong>Estado:</strong> ${battleData.status || 'Activa'}</div>
        <div><strong>Modo:</strong> ${battleData.mode || 'Normal'}</div>
        <div><strong>Héroes:</strong> ${heroNames}</div>
        <div><strong>Villanos:</strong> ${villainNames}</div>
    `;
}

// Configurar eventos de la interfaz
function setupInterface(game) {
    // Botón para salir de la batalla
    const exitButton = document.getElementById('exitBattle');
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            if (confirm('¿Seguro que quieres salir de la batalla?')) {
                window.location.href = './index.html';
            }
        });
    }
    
    // Botón para ocultar los controles
    const hideControlsButton = document.getElementById('hideControls');
    const controlsInfo = document.getElementById('controlsInfo');
    if (hideControlsButton && controlsInfo) {
        hideControlsButton.addEventListener('click', () => {
            controlsInfo.style.display = 'none';
            
            // Mostrar botón para volver a mostrar controles
            const showButton = document.createElement('button');
            showButton.id = 'showControls';
            showButton.textContent = 'Mostrar Controles';
            showButton.style.position = 'absolute';
            showButton.style.bottom = '20px';
            showButton.style.left = '20px';
            showButton.style.backgroundColor = '#5bc0de';
            showButton.style.color = 'white';
            showButton.style.border = 'none';
            showButton.style.padding = '5px 10px';
            showButton.style.borderRadius = '4px';
            showButton.style.cursor = 'pointer';
            showButton.style.zIndex = '100';
            
            showButton.addEventListener('click', () => {
                controlsInfo.style.display = 'block';
                showButton.remove();
            });
            
            document.body.appendChild(showButton);
        });
    }
}

// Utilidades para mostrar mensajes
function showError(message) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.textContent = message;
    errorMsg.style.position = 'fixed';
    errorMsg.style.top = '20px';
    errorMsg.style.left = '50%';
    errorMsg.style.transform = 'translateX(-50%)';
    errorMsg.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    errorMsg.style.color = 'white';
    errorMsg.style.padding = '10px 20px';
    errorMsg.style.borderRadius = '5px';
    errorMsg.style.zIndex = '1000';
    
    document.body.appendChild(errorMsg);
    
    setTimeout(() => {
        errorMsg.remove();
    }, 3000);
}

function showLoader(message) {
    let loader = document.getElementById('gameLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'gameLoader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <p id="loaderMessage">${message || 'Cargando...'}</p>
            </div>
        `;
        
        // Estilos inline para el loader
        loader.style.position = 'fixed';
        loader.style.top = '0';
        loader.style.left = '0';
        loader.style.width = '100%';
        loader.style.height = '100%';
        loader.style.backgroundColor = 'rgba(0,0,0,0.8)';
        loader.style.display = 'flex';
        loader.style.justifyContent = 'center';
        loader.style.alignItems = 'center';
        loader.style.zIndex = '2000';
        
        const content = loader.querySelector('.loader-content');
        content.style.textAlign = 'center';
        content.style.color = 'white';
        
        const spinner = loader.querySelector('.spinner');
        spinner.style.border = '6px solid rgba(255, 255, 255, 0.3)';
        spinner.style.borderTop = '6px solid #3498db';
        spinner.style.borderRadius = '50%';
        spinner.style.width = '40px';
        spinner.style.height = '40px';
        spinner.style.margin = '0 auto 20px';
        spinner.style.animation = 'spin 2s linear infinite';
        
        // Añadir keyframes para la animación
        if (!document.querySelector('#spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.innerHTML = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(loader);
    } else {
        // Actualizar mensaje si el loader ya existe
        const messageEl = loader.querySelector('#loaderMessage');
        if (messageEl) {
            messageEl.textContent = message || 'Cargando...';
        }
    }
}

function updateLoadingMessage(message) {
    const messageEl = document.querySelector('#loaderMessage');
    if (messageEl) {
        messageEl.textContent = message;
    }
    console.log('Loading:', message);
}

function hideLoader() {
    // Ocultar loader del juego
    const loader = document.getElementById('gameLoader');
    if (loader) {
        loader.remove();
    }
    
    // Ocultar pantalla de carga inicial
    if (window.hideInitialLoadingScreen) {
        window.hideInitialLoadingScreen();
    }
}

// Función auxiliar para agregar timeout a las promesas
function promiseWithTimeout(promise, timeoutMs) {
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(`Operation timed out after ${timeoutMs} ms`));
        }, timeoutMs);
    });

    return Promise.race([
        promise,
        timeoutPromise
    ]).then(result => {
        clearTimeout(timeoutHandle);
        return result;
    }).catch(error => {
        clearTimeout(timeoutHandle);
        throw error;
    });
}

// Iniciar el juego con manejo de errores mejorado
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando juego de batalla por equipos...');
    
    try {
        // Iniciar con timeout para evitar bloqueos indefinidos
        promiseWithTimeout(initTeamBattleGame(), 30000) // 30 segundos máximo
            .catch(error => {
                console.error('Error crítico inicializando el juego:', error);
                showError('Error inicializando el juego: ' + (error.message || 'Error desconocido'));
                
                // Agregar botón de emergencia para volver
                const emergencyButton = document.createElement('button');
                emergencyButton.textContent = 'Volver a la lista de batallas';
                emergencyButton.style.position = 'fixed';
                emergencyButton.style.top = '50%';
                emergencyButton.style.left = '50%';
                emergencyButton.style.transform = 'translate(-50%, -50%)';
                emergencyButton.style.padding = '20px';
                emergencyButton.style.backgroundColor = '#4CAF50';
                emergencyButton.style.color = 'white';
                emergencyButton.style.border = 'none';
                emergencyButton.style.borderRadius = '5px';
                emergencyButton.style.cursor = 'pointer';
                emergencyButton.style.zIndex = '9999';
                emergencyButton.style.fontSize = '18px';
                
                emergencyButton.addEventListener('click', () => {
                    window.location.href = './index.html';
                });
                
                document.body.appendChild(emergencyButton);
            });
    } catch (error) {
        console.error('Error inicial:', error);
        showError('Error inicial: ' + (error.message || 'Error desconocido'));
    }
});
