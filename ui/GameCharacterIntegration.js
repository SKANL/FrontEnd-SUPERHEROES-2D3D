// Sistema de integración principal entre personajes del juego y API
import { CharacterSelector } from './components/CharacterSelector.js';
import { getCharactersByFaction, createApiDataFromGameCharacter } from '../characters/GameCharacters.js';

/**
 * Clase principal para manejar la integración entre personajes del juego y la API
 */
export class GameCharacterIntegration {
  constructor() {
    this.loadedSelectors = new Map();
    this.characterDatabase = new Map();
    
    // Cargar estilos necesarios
    this.loadStyles();
    
    // Inicializar base de datos de personajes
    this.initializeCharacterDatabase();
  }

  /**
   * Cargar estilos CSS necesarios para la integración
   */
  loadStyles() {
    const stylesheets = [
      '../components/CharacterSelector.css',
      '../components/CharacterIntegration.css'
    ];

    stylesheets.forEach(href => {
      if (!document.querySelector(`link[href*="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Inicializar base de datos de personajes en memoria
   */
  initializeCharacterDatabase() {
    const heroes = getCharactersByFaction('hero');
    const villains = getCharactersByFaction('villain');
    const neutrals = getCharactersByFaction('neutral');

    this.characterDatabase.set('hero', heroes);
    this.characterDatabase.set('villain', villains);
    this.characterDatabase.set('neutral', neutrals);
    this.characterDatabase.set('all', [...heroes, ...villains, ...neutrals]);

    console.log('Base de datos de personajes inicializada:', {
      heroes: heroes.length,
      villains: villains.length,
      neutrals: neutrals.length,
      total: this.characterDatabase.get('all').length
    });
  }

  /**
   * Crear selector de personajes para una facción específica
   * @param {string} containerId - ID del contenedor donde renderizar
   * @param {string} faction - 'hero', 'villain', o 'all'
   * @param {Object} options - Opciones adicionales para el selector
   * @returns {CharacterSelector} - Instancia del selector creado
   */
  createCharacterSelector(containerId, faction = 'all', options = {}) {
    const defaultOptions = {
      faction: faction,
      multiSelect: false,
      allowCustomization: true,
      showPreview: true,
      showStats: true,
      onSelect: (character) => {
        console.log('Personaje seleccionado:', character);
      },
      onConfirm: (character, customData) => {
        console.log('Confirmación de personaje:', { character, customData });
      }
    };

    const finalOptions = { ...defaultOptions, ...options };
    const selector = new CharacterSelector(containerId, finalOptions);
    
    // Guardar referencia del selector
    this.loadedSelectors.set(containerId, selector);
    
    return selector;
  }

  /**
   * Crear formulario completo de creación con selector de personajes
   * @param {string} containerId - ID del contenedor
   * @param {string} type - 'hero' o 'villain'
   * @param {Function} onComplete - Callback cuando se complete la creación
   */
  createCharacterCreationForm(containerId, type, onComplete) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Contenedor ${containerId} no encontrado`);
    }

    const faction = type === 'hero' ? 'hero' : 'villain';
    const title = type === 'hero' ? '🦸‍♂️ Crear Nuevo Héroe' : '🦹‍♂️ Crear Nuevo Villano';
    const description = `Selecciona un personaje del juego para crear tu ${type}`;

    container.innerHTML = `
      <div class='character-selection-container'>
        <div class='selection-header'>
          <h2>${title}</h2>
          <p>${description}</p>
        </div>
        <div id='${containerId}-selector'></div>
      </div>
    `;

    const selector = this.createCharacterSelector(`${containerId}-selector`, faction, {
      onConfirm: (character, customData) => {
        if (character && customData) {
          const apiData = createApiDataFromGameCharacter(character, customData, faction);
          
          if (!apiData.name || !apiData.alias) {
            alert(`Por favor, completa el nombre y alias del ${type}`);
            return;
          }
          
          console.log(`Datos para crear ${type}:`, apiData);
          onComplete(apiData);
        }
      }
    });

    selector.render();
    return selector;
  }

  /**
   * Obtener personajes disponibles por facción
   * @param {string} faction - 'hero', 'villain', 'neutral', o 'all'
   * @returns {Array} - Lista de personajes
   */
  getAvailableCharacters(faction = 'all') {
    return this.characterDatabase.get(faction) || [];
  }

  /**
   * Buscar personajes por criterios específicos
   * @param {Object} criteria - Criterios de búsqueda
   * @returns {Array} - Personajes que coinciden
   */
  searchCharacters(criteria = {}) {
    const allCharacters = this.characterDatabase.get('all');
    
    return allCharacters.filter(character => {
      // Filtrar por facción
      if (criteria.faction && !character.factions.includes(criteria.faction)) {
        return false;
      }
      
      // Filtrar por tipo
      if (criteria.type && character.type !== criteria.type) {
        return false;
      }
      
      // Filtrar por nombre
      if (criteria.name && !character.name.toLowerCase().includes(criteria.name.toLowerCase())) {
        return false;
      }
      
      // Filtrar por ciudad
      if (criteria.city && !character.cities.includes(criteria.city)) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Validar datos antes de enviar a la API
   * @param {Object} apiData - Datos a validar
   * @param {string} type - 'hero' o 'villain'
   * @returns {Object} - Resultado de validación
   */
  validateApiData(apiData, type) {
    const errors = [];
    const warnings = [];

    // Validaciones básicas
    if (!apiData.name || apiData.name.trim() === '') {
      errors.push('El nombre es requerido');
    }

    if (!apiData.alias || apiData.alias.trim() === '') {
      errors.push('El alias es requerido');
    }

    if (!apiData.city || apiData.city.trim() === '') {
      errors.push('La ciudad es requerida');
    }

    // Validaciones de stats
    if (apiData.health < 30) {
      warnings.push('La salud es muy baja');
    }

    if (apiData.attack < 20) {
      warnings.push('El ataque es muy bajo');
    }

    if (apiData.defense < 15) {
      warnings.push('La defensa es muy baja');
    }

    // Validación de facción vs tipo
    if (type === 'hero' && apiData.faction === 'villain') {
      warnings.push('Estás creando un héroe con un personaje típicamente villano');
    }

    if (type === 'villain' && apiData.faction === 'hero') {
      warnings.push('Estás creando un villano con un personaje típicamente héroe');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Enriquecer datos de personajes de la API con información del juego
   * @param {Array} apiCharacters - Personajes de la API
   * @returns {Array} - Personajes enriquecidos
   */
  enrichApiCharacters(apiCharacters) {
    return apiCharacters.map(apiChar => {
      if (apiChar.gameCharacterId) {
        const gameCharacter = this.findGameCharacterById(apiChar.gameCharacterId);
        if (gameCharacter) {
          return {
            ...apiChar,
            gameCharacterData: gameCharacter,
            hasGameCharacter: true
          };
        }
      }
      
      return {
        ...apiChar,
        hasGameCharacter: false
      };
    });
  }

  /**
   * Buscar personaje del juego por ID
   * @param {string} characterId - ID del personaje
   * @returns {Object|null} - Personaje encontrado o null
   */
  findGameCharacterById(characterId) {
    const allCharacters = this.characterDatabase.get('all');
    return allCharacters.find(char => char.id === characterId) || null;
  }

  /**
   * Obtener estadísticas de uso de personajes
   * @param {Array} apiCharacters - Personajes de la API
   * @returns {Object} - Estadísticas de uso
   */
  getUsageStats(apiCharacters) {
    const stats = {
      totalWithGameCharacter: 0,
      totalWithoutGameCharacter: 0,
      byCharacterType: {},
      byFaction: { hero: 0, villain: 0, neutral: 0 },
      mostUsedCharacters: {}
    };

    apiCharacters.forEach(apiChar => {
      if (apiChar.gameCharacterId) {
        stats.totalWithGameCharacter++;
        
        // Contar por tipo de personaje
        const type = apiChar.characterType || 'unknown';
        stats.byCharacterType[type] = (stats.byCharacterType[type] || 0) + 1;
        
        // Contar por facción
        const faction = apiChar.faction || 'neutral';
        if (stats.byFaction[faction] !== undefined) {
          stats.byFaction[faction]++;
        }
        
        // Contar personajes más usados
        const charId = apiChar.gameCharacterId;
        stats.mostUsedCharacters[charId] = (stats.mostUsedCharacters[charId] || 0) + 1;
      } else {
        stats.totalWithoutGameCharacter++;
      }
    });

    return stats;
  }

  /**
   * Limpiar selectores cargados
   */
  cleanup() {
    this.loadedSelectors.forEach(selector => {
      if (selector.destroy) {
        selector.destroy();
      }
    });
    this.loadedSelectors.clear();
  }
}

// Crear instancia global del sistema de integración
export const gameIntegration = new GameCharacterIntegration();

// Funciones de utilidad para usar en otros módulos
export function createHeroSelector(containerId, onComplete) {
  return gameIntegration.createCharacterCreationForm(containerId, 'hero', onComplete);
}

export function createVillainSelector(containerId, onComplete) {
  return gameIntegration.createCharacterCreationForm(containerId, 'villain', onComplete);
}

export function enrichWithGameData(apiCharacters) {
  return gameIntegration.enrichApiCharacters(apiCharacters);
}

export function validateCharacterData(apiData, type) {
  return gameIntegration.validateApiData(apiData, type);
}
