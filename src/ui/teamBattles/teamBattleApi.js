const BASE_URL = 'https://api-superheroes-production.up.railway.app';

// Rate limiting y retry logic
const apiCallQueue = [];
let lastApiCall = 0;
const API_CALL_DELAY = 100; // 100ms entre llamadas

async function makeApiCall(url, options = {}) {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    const delay = Math.max(0, API_CALL_DELAY - timeSinceLastCall);
    
    setTimeout(async () => {
      lastApiCall = Date.now();
      
      try {
        console.log(`[API] Llamada a: ${url}`);
        const response = await fetch(url, options);
        
        // Manejar errores HTTP específicos
        if (!response.ok) {
          if (response.status === 429) {
            console.warn('[API] Rate limit alcanzado, reintentando en 2 segundos...');
            // Retry después de 2 segundos
            setTimeout(() => {
              makeApiCall(url, options).then(resolve).catch(reject);
            }, 2000);
            return;
          }
          
          let errorMessage = `Error HTTP ${response.status}`;
          try {
            const errorData = await response.text();
            // Verificar si la respuesta es JSON
            if (response.headers.get('content-type')?.includes('application/json')) {
              const jsonError = JSON.parse(errorData);
              errorMessage = jsonError.message || errorMessage;
            } else {
              // Si no es JSON, probablemente es HTML de error
              console.warn('[API] Respuesta no-JSON recibida:', errorData.substring(0, 200));
              errorMessage = 'Error del servidor - respuesta inválida';
            }
          } catch (parseError) {
            console.warn('[API] Error parseando respuesta de error:', parseError);
          }
          
          throw new Error(errorMessage);
        }
        
        // Verificar que la respuesta es JSON válido
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          console.warn('[API] Respuesta no es JSON:', contentType);
          const text = await response.text();
          console.warn('[API] Contenido de respuesta:', text.substring(0, 200));
          throw new Error('Respuesta del servidor no es JSON válido');
        }
        
        const data = await response.json();
        console.log(`[API] Respuesta exitosa de: ${url}`);
        resolve(data);
        
      } catch (error) {
        console.error(`[API] Error en: ${url}`, error);
        reject(error);
      }
    }, delay);
  });
}

export async function createTeamBattle(data, token) {
  console.log('[API][createTeamBattle] Request:', data);
  return await makeApiCall(`${BASE_URL}/api/team-battles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
}

export async function getTeamBattles(token) {
  console.log('[API][getTeamBattles] Request');
  return await makeApiCall(`${BASE_URL}/api/team-battles`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function getTeamBattleById(id, token) {
  console.log('[API][getTeamBattleById] Request:', id);
  return await makeApiCall(`${BASE_URL}/api/team-battles/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

// Seleccionar bando en batalla de equipos
export async function selectSide(id, side, token) {
  console.log('[API][selectSide] Request:', { id, side });
  
  // Primero intentar con el ID en la URL (más común en APIs REST)
  try {
    console.log('[API][selectSide] Intentando con ID en URL...');
    return await makeApiCall(`${BASE_URL}/api/team-battles/${id}/select-side`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ side })
    });
  } catch (error) {
    console.warn('[API][selectSide] Error con ID en URL, intentando endpoint alternativo:', error.message);
    
    // Si falla, intentar con el endpoint sin ID en URL pero con battleId en body
    try {
      console.log('[API][selectSide] Intentando con battleId en body...');
      return await makeApiCall(`${BASE_URL}/api/team-battles/select-side`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          battleId: id,
          side: side 
        })
      });
    } catch (secondError) {
      console.error('[API][selectSide] Error en ambos intentos:', secondError.message);
      throw new Error(`Error seleccionando bando: ${secondError.message}`);
    }
  }
}

export async function getBattleState(id, token) {
  console.log('[API][getBattleState] Request:', id);
  return await makeApiCall(`${BASE_URL}/api/team-battles/${id}/state`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function sendRoundActions(id, actions, token) {
  console.log('[API][sendRoundActions] Request:', { id, actions });
  return await makeApiCall(`${BASE_URL}/api/team-battles/${id}/rounds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(actions)
  });
}

export async function sendAttack(id, data, token) {
  console.log('[API][sendAttack] Request:', { id, data });
  return await makeApiCall(`${BASE_URL}/api/team-battles/${id}/attack`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
}

export async function updateTeamBattle(id, data, token) {
  console.log('[API][updateTeamBattle] Request:', { id, data });
  return await makeApiCall(`${BASE_URL}/api/team-battles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
}

export async function finishTeamBattle(id, token) {
  console.log('[API][finishTeamBattle] Request:', id);
  return await makeApiCall(`${BASE_URL}/api/team-battles/${id}/finish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function restartTeamBattle(id, token) {
  console.log('[API][restartTeamBattle] Request:', id);
  return await makeApiCall(`${BASE_URL}/api/team-battles/${id}/restart`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

// Iniciar o reiniciar batalla
export async function startTeamBattle(id, token) {
  console.log('[API][startTeamBattle] Request:', id);
  return await makeApiCall(`${BASE_URL}/api/team-battles/${id}/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function deleteTeamBattle(id, token) {
  console.log('[API][deleteTeamBattle] Request:', id);
  return await makeApiCall(`${BASE_URL}/api/team-battles/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}
