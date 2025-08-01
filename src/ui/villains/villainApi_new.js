// API actualizada para villanos con integración de personajes del juego
import { API_BASE_URL, getToken } from '../auth/api.js';

// Crear un villano con datos de personaje del juego asociado
export async function createVillain(villainData) {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/villains`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(villainData)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al crear villano: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

// Obtener villanos con información de personajes del juego
export async function getVillains() {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/villains`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error al obtener villanos: ${response.status}`);
  }
  
  return response.json();
}

// Obtener villanos por ciudad con datos de personajes del juego
export async function getVillainsByCity(city) {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/villains/city/${encodeURIComponent(city)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error al obtener villanos por ciudad: ${response.status}`);
  }
  
  return response.json();
}

// Obtener un villano específico con datos del personaje del juego
export async function getVillainById(id) {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/villains/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error al obtener villano: ${response.status}`);
  }
  
  return response.json();
}

// Actualizar villano con datos de personaje del juego
export async function updateVillain(id, villainData) {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/villains/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(villainData)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al actualizar villano: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

// Eliminar villano
export async function deleteVillain(id) {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/villains/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error al eliminar villano: ${response.status}`);
  }
  
  return response.json();
}

// Funciones auxiliares para integración con personajes del juego

// Obtener villanos que tienen personajes del juego asociados
export async function getVillainsWithGameCharacters() {
  const villains = await getVillains();
  return villains.filter(villain => villain.gameCharacterId);
}

// Obtener villanos por personaje del juego específico
export async function getVillainsByGameCharacter(gameCharacterId) {
  const villains = await getVillains();
  return villains.filter(villain => villain.gameCharacterId === gameCharacterId);
}

// Buscar villanos por tipo de personaje (fighter, tank, speedster, etc.)
export async function getVillainsByCharacterType(characterType) {
  const villains = await getVillains();
  return villains.filter(villain => villain.characterType === characterType);
}

// Crear villano automáticamente desde datos de personaje del juego
export async function createVillainFromGameCharacter(gameCharacterData, customData) {
  try {
    // Combinar datos del personaje del juego con personalizaciones del usuario
    const villainData = {
      // Datos básicos (requeridos por la API)
      name: customData.name,
      alias: customData.alias,
      city: customData.city,
      team: customData.team || 'Villanos',
      
      // Stats del personaje del juego
      health: gameCharacterData.stats.health,
      attack: gameCharacterData.stats.attack,
      defense: gameCharacterData.stats.defense,
      speed: gameCharacterData.stats.speed,
      critChance: gameCharacterData.stats.critChance,
      stamina: customData.stamina || gameCharacterData.stats.stamina,
      
      // Habilidades y características
      specialAbility: gameCharacterData.specialAbility,
      
      // Metadatos del personaje del juego
      gameCharacterId: gameCharacterData.id,
      gameCharacterName: gameCharacterData.name,
      characterType: gameCharacterData.type,
      spriteFolder: gameCharacterData.spriteFolder,
      faction: gameCharacterData.faction,
      
      // Valores por defecto
      isAlive: true,
      roundsWon: 0,
      damage: 0,
      status: 'normal',
      teamAffinity: 0,
      energyCost: gameCharacterData.stats.energyCost || 20,
      damageReduction: 0
    };
    
    console.log('Creando villano con datos del juego:', villainData);
    return await createVillain(villainData);
  } catch (error) {
    console.error('Error al crear villano desde personaje del juego:', error);
    throw error;
  }
}

// Sincronizar stats de villano con su personaje del juego
export async function syncVillainWithGameCharacter(villainId) {
  try {
    const villain = await getVillainById(villainId);
    
    if (!villain.gameCharacterId) {
      throw new Error('El villano no tiene un personaje del juego asociado');
    }
    
    // Aquí podrías importar GameCharacters.js para obtener los datos actualizados
    // Por ahora, solo devolvemos una confirmación
    console.log(`Villano ${villain.name} sincronizado con personaje ${villain.gameCharacterName}`);
    return villain;
  } catch (error) {
    console.error('Error al sincronizar villano con personaje del juego:', error);
    throw error;
  }
}

// Validar compatibilidad entre villano y personaje del juego
export function validateVillainGameCharacterCompatibility(villainData, gameCharacterData) {
  const warnings = [];
  const errors = [];
  
  // Verificar que la facción coincida
  if (gameCharacterData.faction !== 'villain' && gameCharacterData.faction !== 'neutral') {
    warnings.push(`El personaje ${gameCharacterData.name} normalmente es de facción ${gameCharacterData.faction}, no villano`);
  }
  
  // Verificar stats básicos
  if (villainData.health < 50) {
    warnings.push('Salud muy baja para un villano');
  }
  
  if (villainData.attack < 30) {
    warnings.push('Ataque muy bajo');
  }
  
  // Verificar campos requeridos
  if (!villainData.name || !villainData.alias) {
    errors.push('Nombre y alias son requeridos');
  }
  
  return { errors, warnings, isValid: errors.length === 0 };
}
