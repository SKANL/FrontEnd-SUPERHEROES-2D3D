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
    const heroes = await getHeroes();
    const villains = await getVillains();
    console.log('Héroes recibidos:', heroes);
    console.log('Villanos recibidos:', villains);
    const heroSelect = document.getElementById('heroSelect');
    const villainSelect = document.getElementById('villainSelect');
    heroSelect.innerHTML = heroes.map(h => `<option value="${h.id}">${h.name} (${h.alias})</option>`).join('');
    villainSelect.innerHTML = villains.map(v => `<option value="${v.id}">${v.name} (${v.alias})</option>`).join('');
  } catch (err) {
    showError('Error cargando héroes o villanos');
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
    const battles = await getTeamBattles(token);
    console.log('[DEBUG] Batallas cargadas:', battles);
    const list = document.getElementById('teamBattlesList');
    list.innerHTML = '';
    if (!battles.length) {
      list.innerHTML = '<div class="empty-msg">No tienes batallas por equipos.</div>';
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
    showError('Error cargando batallas');
  }
}

// Show battle details
window.showBattle = async (id) => {
  console.log('[DEBUG] Mostrar batalla id:', id);
  try {
    const battle = await getTeamBattleById(id, token);
    console.log('[DEBUG] Detalles batalla:', battle);
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
  actionsDiv.innerHTML = `
    <button onclick="selectBattleSide('${battle.id}')">Seleccionar bando</button>
    <button onclick="getBattleState('${battle.id}')">Consultar estado</button>
    <button onclick="showRoundActions('${battle.id}')">Acciones por ronda</button>
    <button onclick="showAttack('${battle.id}')">Ejecutar ataque</button>
    <button onclick="showUpdateBattle('${battle.id}')">Actualizar batalla</button>
    <button onclick="finishBattle('${battle.id}')">Finalizar batalla</button>
    <button onclick="startBattle('${battle.id}')">Iniciar/Reiniciar batalla</button>
  `;
}

// Select side
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

// Get battle state
window.getBattleState = async (id) => {
  console.log('[DEBUG] Click en Consultar estado para batalla:', id);
  console.log('[DEBUG] Consultar estado batalla id:', id);
  try {
    const state = await getBattleState(id, token);
    console.log('[DEBUG] Estado batalla (respuesta API):', state);
    alert(JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('[DEBUG] Error consultando estado:', err);
    showError('Error consultando estado');
  }
};

// Round actions
window.showRoundActions = (id) => {
  console.log('[DEBUG] Click en Acciones por ronda para batalla:', id);
  const actions = prompt('Acciones JSON: {"heroActions":[],"villainActions":[]}');
  try {
    const parsed = JSON.parse(actions);
    console.log('[DEBUG] Acciones por ronda:', { id, parsed });
    sendRoundActions(id, parsed, token)
      .then(resp => {
        console.log('[DEBUG] Respuesta acciones por ronda:', resp);
        showSuccess('Acciones enviadas');
      })
      .catch((err) => {
        console.error('[DEBUG] Error enviando acciones:', err);
        showError('Error enviando acciones');
      });
  } catch (err) {
    console.error('[DEBUG] Formato inválido acciones:', err);
    showError('Formato inválido');
  }
};

// Attack
window.showAttack = (id) => {
  console.log('[DEBUG] Click en Ejecutar ataque para batalla:', id);
  const attackerType = prompt('Tipo atacante: hero o villain');
  const attackerId = prompt('ID atacante');
  const targetId = prompt('ID objetivo');
  const attackType = prompt('Tipo ataque: normal o special');
  console.log('[DEBUG] Ejecutar ataque:', { id, attackerType, attackerId, targetId, attackType });
  sendAttack(id, { attackerType, attackerId, targetId, attackType }, token)
    .then(resp => {
      console.log('[DEBUG] Respuesta ejecutar ataque:', resp);
      showSuccess('Ataque enviado');
    })
    .catch((err) => {
      console.error('[DEBUG] Error enviando ataque:', err);
      showError('Error enviando ataque');
    });
};

// Update battle
window.showUpdateBattle = (id) => {
  console.log('[DEBUG] Click en Actualizar batalla para batalla:', id);
  const heroIds = prompt('IDs héroes separados por coma');
  const villainIds = prompt('IDs villanos separados por coma');
  console.log('[DEBUG] Actualizar batalla:', { id, heroIds, villainIds });
  updateTeamBattle(id, { heroIds: heroIds.split(','), villainIds: villainIds.split(',') }, token)
    .then(resp => {
      console.log('[DEBUG] Respuesta actualizar batalla:', resp);
      showSuccess('Batalla actualizada');
    })
    .catch((err) => {
      console.error('[DEBUG] Error actualizando batalla:', err);
      showError('Error actualizando batalla');
    });
};

// Finish battle
window.finishBattle = (id) => {
  console.log('[DEBUG] Click en Finalizar batalla para batalla:', id);
  console.log('[DEBUG] Finalizar batalla id:', id);
  finishTeamBattle(id, token)
    .then(resp => {
      console.log('[DEBUG] Respuesta finalizar batalla:', resp);
      showSuccess('Batalla finalizada');
    })
    .catch((err) => {
      console.error('[DEBUG] Error finalizando batalla:', err);
      showError('Error finalizando batalla');
    });
};

// Restart battle (internal alias to start endpoint)
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
// Start or restart battle using new start endpoint
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
