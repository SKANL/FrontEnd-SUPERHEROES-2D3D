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
  try {
    const battle = await createTeamBattle({ heroIds, villainIds, mode }, token);
    showSuccess('Batalla creada');
    await loadBattles();
  } catch (err) {
    showError('Error creando batalla');
  }
};

// Load battles list
async function loadBattles() {
  try {
    const battles = await getTeamBattles(token);
    const list = document.getElementById('teamBattlesList');
    list.innerHTML = battles.map(b => `<li><button onclick="showBattle('${b.id}')">${b.id} (${b.mode})</button> <button onclick="deleteBattle('${b.id}')">Eliminar</button></li>`).join('');
  } catch (err) {
    showError('Error cargando batallas');
  }
}

// Show battle details
window.showBattle = async (id) => {
  try {
    const battle = await getTeamBattleById(id, token);
    document.getElementById('battle-details-section').style.display = '';
    document.getElementById('battleDetails').innerHTML = `<pre>${JSON.stringify(battle, null, 2)}</pre>`;
    renderBattleActions(battle);
  } catch (err) {
    showError('Error mostrando batalla');
  }
};

// Delete battle
window.deleteBattle = async (id) => {
  if (!confirm('¿Eliminar batalla?')) return;
  try {
    await deleteTeamBattle(id, token);
    showSuccess('Batalla eliminada');
    await loadBattles();
    document.getElementById('battle-details-section').style.display = 'none';
  } catch (err) {
    showError('Error eliminando batalla');
  }
};

// Render battle actions
function renderBattleActions(battle) {
  const actionsDiv = document.getElementById('battleActions');
  actionsDiv.innerHTML = `
    <button onclick="selectBattleSide('${battle.id}')">Seleccionar bando</button>
    <button onclick="getBattleState('${battle.id}')">Consultar estado</button>
    <button onclick="showRoundActions('${battle.id}')">Acciones por ronda</button>
    <button onclick="showAttack('${battle.id}')">Ejecutar ataque</button>
    <button onclick="showUpdateBattle('${battle.id}')">Actualizar batalla</button>
    <button onclick="finishBattle('${battle.id}')">Finalizar batalla</button>
    <button onclick="restartBattle('${battle.id}')">Reiniciar batalla</button>
  `;
}

// Select side
window.selectBattleSide = async (id) => {
  const side = prompt('Selecciona bando: hero o villain');
  if (!['hero','villain'].includes(side)) return showError('Bando inválido');
  try {
    await selectSide(id, side, token);
    showSuccess('Bando seleccionado');
  } catch (err) {
    showError('Error seleccionando bando');
  }
};

// Get battle state
window.getBattleState = async (id) => {
  try {
    const state = await getBattleState(id, token);
    alert(JSON.stringify(state, null, 2));
  } catch (err) {
    showError('Error consultando estado');
  }
};

// Round actions
window.showRoundActions = (id) => {
  const actions = prompt('Acciones JSON: {"heroActions":[],"villainActions":[]}');
  try {
    const parsed = JSON.parse(actions);
    sendRoundActions(id, parsed, token).then(() => showSuccess('Acciones enviadas')).catch(() => showError('Error enviando acciones'));
  } catch {
    showError('Formato inválido');
  }
};

// Attack
window.showAttack = (id) => {
  const attackerType = prompt('Tipo atacante: hero o villain');
  const attackerId = prompt('ID atacante');
  const targetId = prompt('ID objetivo');
  const attackType = prompt('Tipo ataque: normal o special');
  sendAttack(id, { attackerType, attackerId, targetId, attackType }, token)
    .then(() => showSuccess('Ataque enviado'))
    .catch(() => showError('Error enviando ataque'));
};

// Update battle
window.showUpdateBattle = (id) => {
  const heroIds = prompt('IDs héroes separados por coma');
  const villainIds = prompt('IDs villanos separados por coma');
  updateTeamBattle(id, { heroIds: heroIds.split(','), villainIds: villainIds.split(',') }, token)
    .then(() => showSuccess('Batalla actualizada'))
    .catch(() => showError('Error actualizando batalla'));
};

// Finish battle
window.finishBattle = (id) => {
  finishTeamBattle(id, token)
    .then(() => showSuccess('Batalla finalizada'))
    .catch(() => showError('Error finalizando batalla'));
};

// Restart battle
window.restartBattle = (id) => {
  restartTeamBattle(id, token)
    .then(() => showSuccess('Batalla reiniciada'))
    .catch(() => showError('Error reiniciando batalla'));
};

// Initial load
loadTeamOptions();
loadBattles();
