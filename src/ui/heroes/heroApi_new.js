// API actualizada para héroes con integración de personajes del juego
import { API_BASE_URL, getToken } from '../auth/api.js';

// Crear un héroe con datos de personaje del juego asociado
export async function createHero(heroData) {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/heroes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(heroData)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al crear héroe: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

// Obtener héroes con información de personajes del juego
export async function getHeroes() {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/heroes`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error al obtener héroes: ${response.status}`);
  }
  
  return response.json();
}

// Obtener héroes por ciudad con datos de personajes del juego
export async function getHeroesByCity(city) {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/heroes/city/${encodeURIComponent(city)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error al obtener héroes por ciudad: ${response.status}`);
  }
  
  return response.json();
}

// Obtener un héroe específico con datos del personaje del juego
export async function getHeroById(id) {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/heroes/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error al obtener héroe: ${response.status}`);
  }
  
  return response.json();
}

// Actualizar héroe con datos de personaje del juego
export async function updateHero(id, heroData) {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/heroes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(heroData)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al actualizar héroe: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

// Eliminar héroe
export async function deleteHero(id) {
  const token = getToken();
  if (!token) {
    throw new Error('Token no encontrado');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/heroes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error al eliminar héroe: ${response.status}`);
  }
  
  return response.json();
}

// Funciones auxiliares para integración con personajes del juego

// Obtener héroes que tienen personajes del juego asociados
export async function getHeroesWithGameCharacters() {
  const heroes = await getHeroes();
  return heroes.filter(hero => hero.gameCharacterId);
}

// Obtener héroes por personaje del juego específico
export async function getHeroesByGameCharacter(gameCharacterId) {
  const heroes = await getHeroes();
  return heroes.filter(hero => hero.gameCharacterId === gameCharacterId);
}

// Buscar héroes por tipo de personaje (fighter, tank, speedster, etc.)
export async function getHeroesByCharacterType(characterType) {
  const heroes = await getHeroes();
  return heroes.filter(hero => hero.characterType === characterType);
}

// Crear héroe automáticamente desde datos de personaje del juego
export async function createHeroFromGameCharacter(gameCharacterData, customData) {
  try {
    // Combinar datos del personaje del juego con personalizaciones del usuario
    const heroData = {
      // Datos básicos (requeridos por la API)
      name: customData.name,
      alias: customData.alias,
      city: customData.city,
      team: customData.team || 'Héroes',
      
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
    
    console.log('Creando héroe con datos del juego:', heroData);
    return await createHero(heroData);
  } catch (error) {
    console.error('Error al crear héroe desde personaje del juego:', error);
    throw error;
  }
}

// Sincronizar stats de héroe con su personaje del juego
export async function syncHeroWithGameCharacter(heroId) {
  try {
    const hero = await getHeroById(heroId);
    
    if (!hero.gameCharacterId) {
      throw new Error('El héroe no tiene un personaje del juego asociado');
    }
    
    // Aquí podrías importar GameCharacters.js para obtener los datos actualizados
    // Por ahora, solo devolvemos una confirmación
    console.log(`Héroe ${hero.name} sincronizado con personaje ${hero.gameCharacterName}`);
    return hero;
  } catch (error) {
    console.error('Error al sincronizar héroe con personaje del juego:', error);
    throw error;
  }
}

// Validar compatibilidad entre héroe y personaje del juego
export function validateHeroGameCharacterCompatibility(heroData, gameCharacterData) {
  const warnings = [];
  const errors = [];
  
  // Verificar que la facción coincida
  if (gameCharacterData.faction !== 'hero' && gameCharacterData.faction !== 'neutral') {
    warnings.push(`El personaje ${gameCharacterData.name} normalmente es de facción ${gameCharacterData.faction}, no héroe`);
  }
  
  // Verificar stats básicos
  if (heroData.health < 50) {
    warnings.push('Salud muy baja para un héroe');
  }
  
  if (heroData.attack < 30) {
    warnings.push('Ataque muy bajo');
  }
  
  // Verificar campos requeridos
  if (!heroData.name || !heroData.alias) {
    errors.push('Nombre y alias son requeridos');
  }
  
  return { errors, warnings, isValid: errors.length === 0 };
}
