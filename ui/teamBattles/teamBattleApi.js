const BASE_URL = 'https://api-superheroes-production.up.railway.app';

export async function createTeamBattle(data, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error creando batalla');
  return res.json();
}

export async function getTeamBattles(token) {
  const res = await fetch(`${BASE_URL}/api/team-battles`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error obteniendo batallas');
  return res.json();
}

export async function getTeamBattleById(id, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error obteniendo batalla');
  return res.json();
}

export async function selectSide(id, side, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles/select-side`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ side })
  });
  if (!res.ok) throw new Error('Error seleccionando bando');
  return res.json();
}

export async function getBattleState(id, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}/state`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error obteniendo estado');
  return res.json();
}

export async function sendRoundActions(id, actions, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}/rounds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(actions)
  });
  if (!res.ok) throw new Error('Error enviando acciones');
  return res.json();
}

export async function sendAttack(id, data, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}/attack`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error enviando ataque');
  return res.json();
}

export async function updateTeamBattle(id, data, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error actualizando batalla');
  return res.json();
}

export async function finishTeamBattle(id, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}/finish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error finalizando batalla');
  return res.json();
}

export async function restartTeamBattle(id, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}/restart`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error reiniciando batalla');
  return res.json();
}

export async function deleteTeamBattle(id, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error eliminando batalla');
  return res.json();
}
