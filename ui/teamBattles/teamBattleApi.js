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
  if (!res.ok) {
    let msg = 'Error creando batalla';
    try { msg = (await res.json()).message || msg; } catch {}
    throw new Error(msg);
  }
  return await res.json();
}

export async function getTeamBattles(token) {
  const res = await fetch(`${BASE_URL}/api/team-battles`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    let msg = 'Error obteniendo batallas';
    try { msg = (await res.json()).message || msg; } catch {}
    throw new Error(msg);
  }
  return await res.json();
}

export async function getTeamBattleById(id, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    let msg = 'Error obteniendo batalla';
    try { msg = (await res.json()).message || msg; } catch {}
    throw new Error(msg);
  }
  return await res.json();
}

// Seleccionar bando en batalla de equipos
export async function selectSide(id, side, token) {
  console.log('[API][selectSide] Request:', { id, side });
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}/select-side`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ side })
  });
  if (!res.ok) {
    let msg = 'Error seleccionando bando';
    try { msg = (await res.json()).message || msg; } catch {}
    throw new Error(msg);
  }
  return await res.json();
}

export async function getBattleState(id, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}/state`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    let msg = 'Error obteniendo estado';
    try { msg = (await res.json()).message || msg; } catch {}
    throw new Error(msg);
  }
  return await res.json();
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
  console.log('[API][startBattle] Request iniciar/reiniciar batalla:', id);
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error reiniciando batalla');
  return res.json();
}
// Iniciar o reiniciar batalla (alias para restart)
export const startTeamBattle = restartTeamBattle;

export async function deleteTeamBattle(id, token) {
  const res = await fetch(`${BASE_URL}/api/team-battles/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    let msg = 'Error eliminando batalla';
    try { msg = (await res.json()).message || msg; } catch {}
    throw new Error(msg);
  }
  // Si la respuesta está vacía, no intentes hacer res.json()
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}
