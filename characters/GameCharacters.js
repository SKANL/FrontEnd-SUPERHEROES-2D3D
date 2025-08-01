// Catálogo de personajes disponibles en el juego
export const GAME_CHARACTERS = {
  "baraka": {
    id: "baraka",
    name: "Baraka",
    displayName: "Baraka el Guerrero",
    spriteFolder: "Baraka Complete Edicion",
    type: "fighter", // tipo de personaje
    factions: ["villain", "neutral"], // qué facciones puede usar este personaje
    cities: ["Outworld", "Earthrealm"],
    description: "Guerrero Tarkatan con cuchillas en los brazos",
    portraits: [
      "sprites/Baraka Complete Edicion/Baraka Portada_01.png",
      "sprites/Baraka Complete Edicion/Baraka Portada_02.png",
      "sprites/Baraka Complete Edicion/Baraka Portada_03.png"
    ],
    defaultStats: {
      health: 120,
      attack: 85,
      defense: 60,
      speed: 70,
      critChance: 25,
      specialAbility: "Blade Spark",
      stamina: 100,
      teamAffinity: 0,
      energyCost: 25,
      damageReduction: 5
    },
    animations: {
      idle: ["Baraka Poses"],
      walk: ["Baraka Caminar"], 
      attack: ["Baraka Golpes", "Baraka Patadas"],
      special: ["Baraka Cuchillas", "Baraka Multi Cuchilla"],
      damage: ["Baraka Damage"],
      dead: ["Baraka Dead"],
      winner: ["Baraka Winner"],
      defend: "Baraka Defensa",
      jump: "Baraka Saltar+Girar",
      grab: "Baraka Agarrar+Lanzar Oponente",
      friendship: ["Baraka Freinship"],
      babality: ["Baraka Babality"]
    },
    sounds: ["Baraka VocesY Sonidos"],
    lore: "Baraka es un guerrero Tarkatan feroz con cuchillas retráctiles en sus antebrazos."
  },
  
  "cyrax": {
    id: "cyrax",
    name: "Cyrax",
    displayName: "Cyrax el Cyborg",
    spriteFolder: "Cyrax Complete Edicion", 
    type: "tank",
    factions: ["villain", "hero"], // puede ser usado como villano o héroe
    cities: ["Earthrealm", "Cyber Initiative"],
    description: "Ninja cyborg con arsenal de armas tecnológicas",
    portraits: [
      "sprites/Cyrax Complete Edicion/Cyrax Portada_01.png",
      "sprites/Cyrax Complete Edicion/Cyrax Portada_04.png",
      "sprites/Cyrax Complete Edicion/Cyrax Portada_05.png"
    ],
    defaultStats: {
      health: 150,
      attack: 70,
      defense: 90,
      speed: 50,
      critChance: 15,
      specialAbility: "Net Trap",
      stamina: 120,
      teamAffinity: 10,
      energyCost: 30,
      damageReduction: 15
    },
    animations: {
      idle: ["Cyrax Poses"],
      walk: ["Cyrax Caminar"],
      run: ["Cyrax Correr"], 
      attack: ["Cyrax Golpes", "Cyrax Patadas"],
      special: ["Cyrax Bombas O Trampas"],
      damage: ["Cyrax Damage", "Cyrax Daños"],
      dead: ["Cyrax Dead"],
      winner: ["Cyrax Wins"],
      defend: ["Cyrax Defensa"],
      jump: ["Cyrax Saltar+Girar"],
      disarm: ["Cyrax Desarmarce"],
      fatality1: ["Cyrax Fatality Explotar"],
      fatality2: ["Cyrax Fatality Helicoptero"],
      friendship: ["Cyrax Frienship"],
      babality: ["Cyrax Babality"],
      animality: ["Cyrax Animality"]
    },
    sounds: ["Cyrax Voces Y Sonidos"],
    lore: "Cyrax es un ninja convertido en cyborg por el clan Lin Kuei, equipado con arsenal tecnológico avanzado."
  }
};

// Función para obtener personajes por facción
export function getCharactersByFaction(faction) {
  return Object.values(GAME_CHARACTERS).filter(char => 
    char.factions.includes(faction)
  );
}

// Función para obtener personaje por ID
export function getCharacterById(id) {
  return Object.values(GAME_CHARACTERS).find(char => char.id === id);
}

// Función para obtener todos los personajes
export function getAllCharacters() {
  return Object.values(GAME_CHARACTERS);
}

// Función para crear datos de API a partir de un personaje del juego
export function createApiDataFromGameCharacter(character, customData = {}, targetFaction = null) {
  // Determinar la facción objetivo (hero o villain)
  const faction = targetFaction || (character.factions.includes('hero') ? 'hero' : 
                                   character.factions.includes('villain') ? 'villain' : 'neutral');
  
  // Ajustar el equipo por defecto según la facción
  let defaultTeam = "Sin equipo";
  if (faction === 'hero') {
    defaultTeam = 'Héroes';
  } else if (faction === 'villain') {
    defaultTeam = 'Villanos';
  }
  
  const baseData = {
    name: customData.name || character.displayName,
    alias: customData.alias || character.displayName,
    city: customData.city || character.cities[0],
    team: customData.team || defaultTeam,
    // Stats del personaje del juego
    health: character.defaultStats.health,
    attack: character.defaultStats.attack,
    defense: character.defaultStats.defense,
    speed: character.defaultStats.speed,
    critChance: character.defaultStats.critChance,
    specialAbility: character.defaultStats.specialAbility,
    stamina: character.defaultStats.stamina,
    teamAffinity: character.defaultStats.teamAffinity,
    energyCost: character.defaultStats.energyCost,
    damageReduction: character.defaultStats.damageReduction,
    // Datos del juego
    gameCharacterId: character.id,
    gameCharacterName: character.name,
    spriteFolder: character.spriteFolder,
    characterType: character.type,
    faction: faction,
    // Estados por defecto
    isAlive: true,
    roundsWon: 0,
    damage: 0,
    status: "normal"
  };
  
  // Sobrescribir con datos personalizados
  return { ...baseData, ...customData };
}
