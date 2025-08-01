import { getToken, logout, showError, showSuccess } from '../auth/utils.js';
import { getHeroes } from '../heroes/heroApi.js';
import { getVillains } from '../villains/villainApi.js';
import {
  createTeamBattle,
  getTeamBattles,
  getTeamBattleById,
  selectSide,
  getBattleState,
  sendRoundActions,
  sendAttack,
  updateTeamBattle,
  finishTeamBattle,
  restartTeamBattle,
  startTeamBattle,
  deleteTeamBattle
} from './teamBattleApi.js';

const token = getToken();
if (!token) window.location.href = '../auth/index.html';

document.getElementById('logoutBtn').onclick = logout;

// Load heroes and villains for selection
async function loadTeamOptions() {
  try {
    console.log('[DEBUG] Cargando opciones de equipos...');
    const heroes = await getHeroes();
    const villains = await getVillains();
    console.log('[DEBUG] Héroes recibidos:', heroes);
    console.log('[DEBUG] Villanos recibidos:', villains);
    console.log('[DEBUG] Cantidad de héroes:', heroes?.length || 0);
    console.log('[DEBUG] Cantidad de villanos:', villains?.length || 0);
    
    const heroSelect = document.getElementById('heroSelect');
    const villainSelect = document.getElementById('villainSelect');
    
    if (!heroes || heroes.length === 0) {
      heroSelect.innerHTML = '<option value="">No hay héroes disponibles - Ve a Héroes para crear uno</option>';
    } else {
      heroSelect.innerHTML = heroes.map(h => `<option value="${h.id}">${h.name} (${h.alias})</option>`).join('');
    }
    
    if (!villains || villains.length === 0) {
      villainSelect.innerHTML = '<option value="">No hay villanos disponibles - Ve a Villanos para crear uno</option>';
    } else {
      villainSelect.innerHTML = villains.map(v => `<option value="${v.id}">${v.name} (${v.alias})</option>`).join('');
    }
  } catch (err) {
    console.error('[DEBUG] Error cargando héroes o villanos:', err);
    showError('Error cargando héroes o villanos: ' + err.message);
  }
}

// Create new team battle
const createForm = document.getElementById('createTeamBattleForm');
createForm.onsubmit = async (e) => {
  e.preventDefault();
  const mode = document.getElementById('battleMode').value;
  const heroIds = Array.from(document.getElementById('heroSelect').selectedOptions).map(opt => opt.value);
  const villainIds = Array.from(document.getElementById('villainSelect').selectedOptions).map(opt => opt.value);
  if (heroIds.length === 0 || villainIds.length === 0) {
    showError('Debes seleccionar al menos un héroe y un villano');
    return;
  }
  console.log('[DEBUG] Crear batalla:', { heroIds, villainIds, mode });
  try {
    const battle = await createTeamBattle({ heroIds, villainIds, mode }, token);
    console.log('[DEBUG] Batalla creada:', battle);
    showSuccess('Batalla creada');
    await loadBattles();
  } catch (err) {
    console.error('[DEBUG] Error creando batalla:', err);
    showError('Error creando batalla');
  }
};

// Load battles list
async function loadBattles() {
  try {
    console.log('[DEBUG] Iniciando carga de batallas...');
    const battles = await getTeamBattles(token);
    console.log('[DEBUG] Batallas cargadas:', battles);
    console.log('[DEBUG] Tipo de batallas:', typeof battles);
    console.log('[DEBUG] Es array:', Array.isArray(battles));
    console.log('[DEBUG] Cantidad de batallas:', battles?.length);
    
    const list = document.getElementById('teamBattlesList');
    list.innerHTML = '';
    
    if (!battles || !Array.isArray(battles) || battles.length === 0) {
      list.innerHTML = `
        <div class="empty-msg">
          <h3>No tienes batallas por equipos</h3>
          <p>Para probar el juego, necesitas:</p>
          <ol>
            <li>Seleccionar al menos un héroe y un villano arriba</li>
            <li>Hacer clic en "Crear Batalla"</li>
            <li>Después aparecerá el botón "Jugar batalla"</li>
          </ol>
          <p><strong>Nota:</strong> Asegúrate de tener héroes y villanos creados en tu cuenta.</p>
        </div>
      `;
      return;
    }
    // Tarjetas responsive mejoradas
    list.classList.add('battle-cards-grid');
    battles.forEach(b => {
      const card = document.createElement('li');
      card.className = 'battle-card';
      // Formatear fecha si existe
      let createdAt = b.createdAt ? new Date(b.createdAt).toLocaleString() : '';
      let updatedAt = b.updatedAt ? new Date(b.updatedAt).toLocaleString() : '';
      // Mostrar nombres de héroes y villanos si están disponibles
      let heroes = (b.heroes && Array.isArray(b.heroes)) ? b.heroes : (b.heroIds || []);
      let villains = (b.villains && Array.isArray(b.villains)) ? b.villains : (b.villainIds || []);
      let heroList = heroes.map(h => h.name ? `${h.name} <span class='alias'>(${h.alias||''})</span>` : h).join(', ');
      let villainList = villains.map(v => v.name ? `${v.name} <span class='alias'>(${v.alias||''})</span>` : v).join(', ');
      card.innerHTML = `
        <div class="battle-card-content">
          <div class="battle-id"><span>ID:</span> <span class="mono">${b.id}</span></div>
          <div class="battle-mode"><b>Modo:</b> ${b.mode || '-'} <span class="battle-status">${b.status ? `<b>· Estado:</b> ${b.status}` : ''}</span></div>
          <div class="battle-rounds"><b>Rondas:</b> ${b.rounds?.length ?? (b.roundsCount ?? '-')}</div>
          <div class="battle-teams">
            <div><b>Héroes:</b> <span class="team-list">${heroList || '-'}</span></div>
            <div><b>Villanos:</b> <span class="team-list">${villainList || '-'}</span></div>
          </div>
          <div class="battle-meta">
            ${createdAt ? `<span><b>Creada:</b> ${createdAt}</span>` : ''}
            ${updatedAt ? `<span><b>Actualizada:</b> ${updatedAt}</span>` : ''}
          </div>
        </div>
        <div class="battle-card-actions">
          <button onclick="showBattle('${b.id}')">Ver</button>
          <button onclick="deleteBattle('${b.id}')">Eliminar</button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error('[DEBUG] Error cargando batallas:', err);
    console.error('[DEBUG] Error details:', err.message, err.stack);
    const list = document.getElementById('teamBattlesList');
    list.innerHTML = '<div class="error-msg">Error cargando batallas. Verifica tu conexión y vuelve a intentar.</div>';
    showError('Error cargando batallas: ' + err.message);
  }
}

// Show battle details
window.showBattle = async (id) => {
  console.log('[DEBUG] Mostrar batalla id:', id);
  try {
    const battle = await getTeamBattleById(id, token);
    console.log('[DEBUG] Detalles batalla:', battle);
    
    // Mostrar los detalles de la batalla en la sección correspondiente
    document.getElementById('battle-details-section').style.display = '';
    document.getElementById('battleDetails').innerHTML = `<pre>${JSON.stringify(battle, null, 2)}</pre>`;
    renderBattleActions(battle);
  } catch (err) {
    console.error('[DEBUG] Error mostrando batalla:', err);
    showError('Error mostrando batalla');
  }
};

// Delete battle
window.deleteBattle = async (id) => {
  if (!confirm('¿Eliminar batalla?')) return;
  console.log('[DEBUG] Eliminar batalla id:', id);
  try {
    await deleteTeamBattle(id, token);
    showSuccess('Batalla eliminada');
    await loadBattles();
    document.getElementById('battle-details-section').style.display = 'none';
  } catch (err) {
    console.error('[DEBUG] Error eliminando batalla:', err);
    showError('Error eliminando batalla');
  }
};

// Render battle actions
function renderBattleActions(battle) {
  console.log('[DEBUG] Renderizar acciones para batalla:', battle);
  const actionsDiv = document.getElementById('battleActions');
  
  // Verificar si la batalla ha terminado
  const isFinished = battle.status === 'finished';
  
  actionsDiv.innerHTML = `
    <button onclick="playBattle('${battle.id}')" class="primary-action-button">Jugar batalla</button>
    <button onclick="selectBattleSide('${battle.id}')">Seleccionar bando</button>
    <button onclick="getBattleState('${battle.id}')">Consultar estado</button>
    <button onclick="showRoundActions('${battle.id}')">Acciones por ronda</button>
    <button onclick="showAttack('${battle.id}')">Ejecutar ataque</button>
    <button onclick="showUpdateBattle('${battle.id}')">Actualizar batalla</button>
    <button onclick="finishBattle('${battle.id}')">Finalizar batalla</button>
    <button onclick="startBattle('${battle.id}')">Iniciar/Reiniciar batalla</button>
  `;
}

// Jugar batalla en modo gráfico
window.playBattle = (id) => {
  console.log('[DEBUG] Iniciando batalla en modo gráfico:', id);
  // Redirigir a la interfaz gráfica de batalla
  window.location.href = `./battle.html?battleId=${id}`;
};

// Agregar estilos para destacar el botón de jugar batalla
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .primary-action-button {
      background-color: #4CAF50 !important;
      color: white !important;
      font-weight: bold !important;
      padding: 10px 15px !important;
      border: none !important;
      border-radius: 5px !important;
      cursor: pointer !important;
      margin-bottom: 10px !important;
      transition: background-color 0.3s !important;
      display: block !important;
      width: 100% !important;
    }
    .primary-action-button:hover {
      background-color: #45a049 !important;
    }
  </style>
`);

// Resto de funciones...
window.selectBattleSide = async (id) => {
  console.log('[DEBUG] Click en Seleccionar bando para batalla:', id);
  const side = prompt('Selecciona bando: hero o villain');
  if (!['hero','villain'].includes(side)) return showError('Bando inválido');
  console.log('[DEBUG] Seleccionar bando:', { id, side });
  try {
    const resp = await selectSide(id, side, token);
    console.log('[DEBUG] Respuesta seleccionar bando:', resp);
    showSuccess('Bando seleccionado');
  } catch (err) {
    console.error('[DEBUG] Error seleccionando bando:', err);
    showError('Error seleccionando bando');
  }
};

window.getBattleState = async (id) => {
  console.log('[DEBUG] Click en Consultar estado para batalla:', id);
  try {
    const state = await getBattleState(id, token);
    console.log('[DEBUG] Estado batalla:', state);
    showSuccess('Estado consultado');
  } catch (err) {
    console.error('[DEBUG] Error consultando estado:', err);
    showError('Error consultando estado');
  }
};

window.showRoundActions = (id) => {
  console.log('[DEBUG] Click en Acciones por ronda para batalla:', id);
  const actions = prompt('Ingresa acciones JSON (ejemplo: {"heroActions": [], "villainActions": []})');
  if (!actions) return;
  sendRoundActionsFunc(id, JSON.parse(actions));
};

const sendRoundActionsFunc = async (id, actions) => {
  console.log('[DEBUG] Enviar acciones ronda:', { id, actions });
  try {
    const resp = await sendRoundActions(id, actions, token);
    console.log('[DEBUG] Respuesta acciones:', resp);
    showSuccess('Acciones enviadas');
  } catch (err) {
    console.error('[DEBUG] Error enviando acciones:', err);
    showError('Error enviando acciones');
  }
};

window.showAttack = (id) => {
  console.log('[DEBUG] Click en Ejecutar ataque para batalla:', id);
  const attackerType = prompt('Tipo atacante (hero/villain):');
  const attackerId = prompt('ID atacante:');
  const targetId = prompt('ID objetivo:');
  const attackType = prompt('Tipo ataque (normal/special):');
  if (!attackerType || !attackerId || !targetId || !attackType) return showError('Datos incompletos');
  sendAttackFunc(id, { attackerType, attackerId, targetId, attackType });
};

const sendAttackFunc = async (id, data) => {
  console.log('[DEBUG] Enviar ataque:', { id, data });
  try {
    const resp = await sendAttack(id, data, token);
    console.log('[DEBUG] Respuesta ataque:', resp);
    showSuccess('Ataque ejecutado');
  } catch (err) {
    console.error('[DEBUG] Error ejecutando ataque:', err);
    showError('Error ejecutando ataque');
  }
};

window.showUpdateBattle = (id) => {
  console.log('[DEBUG] Click en Actualizar batalla para batalla:', id);
  const heroIds = prompt('Nuevos IDs héroes (separados por coma):');
  const villainIds = prompt('Nuevos IDs villanos (separados por coma):');
  if (!heroIds || !villainIds) return;
  updateBattleFunc(id, { 
    heroIds: heroIds.split(','), 
    villainIds: villainIds.split(',') 
  });
};

const updateBattleFunc = async (id, data) => {
  console.log('[DEBUG] Actualizar batalla:', { id, data });
  try {
    const resp = await updateTeamBattle(id, data, token);
    console.log('[DEBUG] Respuesta actualización:', resp);
    showSuccess('Batalla actualizada');
    await loadBattles();
  } catch (err) {
    console.error('[DEBUG] Error actualizando batalla:', err);
    showError('Error actualizando batalla');
  }
};

window.finishBattle = async (id) => {
  console.log('[DEBUG] Click en Finalizar batalla para batalla:', id);
  try {
    const resp = await finishTeamBattle(id, token);
    console.log('[DEBUG] Respuesta finalizar batalla:', resp);
    showSuccess('Batalla finalizada');
  } catch (err) {
    console.error('[DEBUG] Error finalizando batalla:', err);
    showError('Error finalizando batalla');
  }
};

window.restartBattle = async (id) => {
  console.log('[DEBUG] Click en Reiniciar batalla para batalla:', id);
  try {
    const resp = await restartTeamBattle(id, token);
    console.log('[DEBUG] Respuesta reiniciar batalla:', resp);
    showSuccess('Batalla reiniciada');
  } catch (err) {
    console.error('[DEBUG] Error reiniciando batalla:', err);
    showError('Error reiniciando batalla');
  }
};

window.startBattle = async (id) => {
  console.log('[DEBUG] Click en Iniciar/Reiniciar batalla para batalla:', id);
  try {
    const resp = await startTeamBattle(id, token);
    console.log('[DEBUG] Respuesta iniciar/reiniciar batalla:', resp);
    showSuccess('Batalla iniciada/reiniciada');
  } catch (err) {
    console.error('[DEBUG] Error iniciando/reiniciando batalla:', err);
    showError('Error iniciando/reiniciando batalla');
  }
};

// Initial load
loadTeamOptions();
loadBattles();
