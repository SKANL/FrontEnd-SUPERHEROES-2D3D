// Nuevo renderer para héroes con selector de personajes del juego
import { logout } from '../auth/utils.js';
import { CharacterSelector } from '../components/CharacterSelector.js';
import { createApiDataFromGameCharacter } from '../../characters/GameCharacters.js';

document.getElementById('logoutBtn')?.addEventListener('click', logout);

export function renderHeroesList(heroes, { onDetail, onEdit, onDelete, isAdmin, userId }) {
  const heroesList = document.getElementById('heroesList');
  heroesList.innerHTML = '';
  if (!heroes.length) {
    heroesList.innerHTML = '<p>No hay héroes registrados.</p>';
    return;
  }
  heroes.forEach(hero => {
    const card = document.createElement('div');
    card.className = 'hero-card';
    const heroId = hero._id || hero.id;
    if (!heroId) {
      console.warn('Hero missing ID:', hero);
    }

    // Mostrar información del personaje del juego si está disponible
    const gameCharacterInfo = hero.gameCharacterId ? 
      `<div class="game-character-info">
        <span class="game-character-badge">🎮 ${hero.gameCharacterName || hero.gameCharacterId}</span>
        <span class="character-type-badge">${hero.characterType || 'unknown'}</span>
      </div>` : '';

    card.innerHTML = `
      ${gameCharacterInfo}
      <div class="hero-info">
        <strong>${hero.name}</strong> <span>(${hero.alias})</span><br>
        <small>Ciudad: ${hero.city} | Equipo: ${hero.team}</small><br>
        <small>Salud: ${hero.health} | Stamina: ${hero.stamina} | Velocidad: ${hero.speed}</small><br>
        <small>Crítico: ${hero.critChance}% | Estado: ${hero.status} | Especial: ${hero.specialAbility}</small>
      </div>
      <div class="hero-actions">
        <button class="detail">Ver Detalle</button>
        ${isAdmin || hero.ownerId === userId ? `<button class="edit">Editar</button>` : ''}
        ${isAdmin || hero.ownerId === userId ? `<button class="delete">Eliminar</button>` : ''}
      </div>
    `;
    card.querySelector('.detail').onclick = () => onDetail(heroId);
    if (isAdmin || hero.ownerId === userId) {
      card.querySelector('.edit').onclick = () => onEdit({ ...hero, _id: heroId });
      card.querySelector('.delete').onclick = () => onDelete(heroId);
    }
    heroesList.appendChild(card);
  });
}

export function renderHeroDetail(hero, onClose) {
  const heroDetailContainer = document.getElementById('heroDetailContainer');
  heroDetailContainer.classList.remove('hidden');

  // Información adicional del personaje del juego
  const gameCharacterSection = hero.gameCharacterId ? 
    `<div class='game-character-section'>
      <h4>🎮 Personaje del Juego</h4>
      <div class='hero-attr'><span>📁 Personaje:</span> ${hero.gameCharacterName || hero.gameCharacterId}</div>
      <div class='hero-attr'><span>🎭 Tipo:</span> ${hero.characterType || 'unknown'}</div>
      <div class='hero-attr'><span>📂 Sprites:</span> ${hero.spriteFolder || 'default'}</div>
    </div>` : '';

  heroDetailContainer.innerHTML = `
    <div class='hero-detail-card'>
      <div class='hero-detail-header'>
        <div class='hero-avatar'>
          <span class='hero-icon'>🦸‍♂️</span>
        </div>
        <div>
          <h2>${hero.name}</h2>
          <h3 class='hero-alias'>${hero.alias}</h3>
        </div>
      </div>
      <div class='hero-detail-body'>
        ${gameCharacterSection}
        <div class='hero-attr'><span>🌆 Ciudad:</span> ${hero.city}</div>
        <div class='hero-attr'><span>🛡️ Equipo:</span> ${hero.team}</div>
        <div class='hero-attr'><span>❤️ Salud:</span> ${hero.health}</div>
        <div class='hero-attr'><span>⚡ Stamina:</span> ${hero.stamina}</div>
        <div class='hero-attr'><span>🏃‍♂️ Velocidad:</span> ${hero.speed}</div>
        <div class='hero-attr'><span>🎯 Crítico:</span> ${hero.critChance}%</div>
        <div class='hero-attr'><span>🔄 Estado:</span> ${hero.status}</div>
        <div class='hero-attr'><span>✨ Especial:</span> ${hero.specialAbility}</div>
        <div class='hero-attr'><span>🟢 Vivo:</span> ${hero.isAlive ? 'Sí' : 'No'}</div>
        <div class='hero-attr'><span>🏆 Rounds Ganados:</span> ${hero.roundsWon}</div>
        <div class='hero-attr'><span>💥 Daño:</span> ${hero.damage}</div>
        <div class='hero-attr'><span>🤝 Afinidad Equipo:</span> ${hero.teamAffinity}</div>
        <div class='hero-attr'><span>🔋 Costo Energía:</span> ${hero.energyCost}</div>
        <div class='hero-attr'><span>🛡️ Reducción Daño:</span> ${hero.damageReduction}</div>
        <div class='hero-attr'><span>⚔️ Ataque:</span> ${hero.attack}</div>
        <div class='hero-attr'><span>🛡️ Defensa:</span> ${hero.defense}</div>
      </div>
      <div class='hero-detail-footer'>
        <button class='cancel'>Cerrar</button>
      </div>
    </div>
  `;
  document.querySelector('#heroDetailContainer .cancel').onclick = onClose;
}

export function renderHeroForm({ hero, isAdmin, isOwner, onSubmit, onCancel }) {
  const heroFormContainer = document.getElementById('heroFormContainer');
  heroFormContainer.classList.remove('hidden');

  if (!hero) {
    // Modo creación - mostrar selector de personajes
    renderCharacterSelectionForm({ onSubmit, onCancel });
  } else {
    // Modo edición - mostrar formulario tradicional
    renderTraditionalForm({ hero, isAdmin, isOwner, onSubmit, onCancel });
  }
}

function renderCharacterSelectionForm({ onSubmit, onCancel }) {
  const heroFormContainer = document.getElementById('heroFormContainer');
  
  heroFormContainer.innerHTML = `
    <div class='character-selection-container'>
      <div class='selection-header'>
        <h2>🦸‍♂️ Crear Nuevo Héroe</h2>
        <p>Selecciona un personaje del juego para crear tu héroe</p>
      </div>
      <div id='character-selector'></div>
    </div>
  `;

  // Cargar estilos del selector si no están cargados
  if (!document.querySelector('link[href*="CharacterSelector.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../components/CharacterSelector.css';
    document.head.appendChild(link);
  }

  // Crear selector de personajes
  const selector = new CharacterSelector('character-selector', {
    faction: 'hero',
    multiSelect: false,
    allowCustomization: true,
    onSelect: (character) => {
      console.log('Personaje seleccionado:', character);
    },
    onConfirm: (character, customData) => {
      if (character && customData) {
        // Crear datos para la API basados en el personaje del juego
        const apiData = createApiDataFromGameCharacter(character, customData, 'hero');
        
        // Validar que los campos requeridos estén completos
        if (!apiData.name || !apiData.alias) {
          alert('Por favor, completa el nombre y alias del héroe');
          return;
        }
        
        console.log('Datos a enviar a la API:', apiData);
        onSubmit(apiData);
      }
    }
  });

  selector.render();

  // Agregar botón de volver al modo tradicional (para admins)
  heroFormContainer.querySelector('.selection-header').insertAdjacentHTML('beforeend', `
    <button class="traditional-mode-btn" onclick="showTraditionalForm()">
      📝 Crear sin personaje del juego
    </button>
  `);

  // Función para mostrar formulario tradicional
  window.showTraditionalForm = () => {
    renderTraditionalForm({ hero: null, isAdmin: true, isOwner: true, onSubmit, onCancel });
  };
}

function renderTraditionalForm({ hero, isAdmin, isOwner, onSubmit, onCancel }) {
  const heroFormContainer = document.getElementById('heroFormContainer');
  
  heroFormContainer.innerHTML = `
    <div class='hero-detail-card'>
      <div class='hero-detail-header'>
        <div class='hero-avatar'>
          <span class='hero-icon'>${hero?._id ? '✏️' : '🦸‍♂️'}</span>
        </div>
        <div>
          <h2>${hero?._id ? 'Editar Héroe' : 'Crear Héroe (Modo Tradicional)'}</h2>
          <h3 class='hero-alias'>${hero?.alias || ''}</h3>
        </div>
      </div>
      <form id='heroForm'>
        <div class='hero-detail-body'>
          ${isAdmin ? `
            <div class='hero-attr'><span>🆔 Nombre:</span> <input name='name' required value='${hero?.name || ''}'></div>
            <div class='hero-attr'><span>🎭 Alias:</span> <input name='alias' required value='${hero?.alias || ''}'></div>
          ` : ''}
          
          <div class='hero-attr'><span>🌆 Ciudad:</span> <input name='city' required value='${hero?.city || ''}'></div>
          <div class='hero-attr'><span>🛡️ Equipo:</span> <input name='team' value='${hero?.team || ''}'></div>
          
          ${isAdmin ? `
            <div class='hero-attr'><span>❤️ Salud:</span> <input name='health' type='number' min='0' max='200' value='${hero?.health ?? 100}'></div>
            <div class='hero-attr'><span>⚔️ Ataque:</span> <input name='attack' type='number' min='0' max='200' value='${hero?.attack ?? 75}'></div>
            <div class='hero-attr'><span>🛡️ Defensa:</span> <input name='defense' type='number' min='0' max='200' value='${hero?.defense ?? 45}'></div>
            <div class='hero-attr'><span>✨ Especial:</span> <input name='specialAbility' value='${hero?.specialAbility || ''}'></div>
          ` : ''}
          
          <div class='hero-attr'><span>⚡ Stamina:</span> <input name='stamina' type='number' min='0' max='200' value='${hero?.stamina ?? 100}'></div>
          <div class='hero-attr'><span>🏃‍♂️ Velocidad:</span> <input name='speed' type='number' min='0' max='200' value='${hero?.speed ?? 60}'></div>
          <div class='hero-attr'><span>🎯 Crítico:</span> <input name='critChance' type='number' min='0' max='100' value='${hero?.critChance ?? 20}'></div>
          <div class='hero-attr'><span>🔄 Estado:</span> <input name='status' value='${hero?.status || 'normal'}'></div>
          
          ${isAdmin ? `
            <div class='hero-attr'><span>🟢 Vivo:</span> <select name='isAlive'><option value='true' ${hero?.isAlive !== false ? 'selected' : ''}>Sí</option><option value='false' ${hero?.isAlive === false ? 'selected' : ''}>No</option></select></div>
            <div class='hero-attr'><span>🏆 Rounds:</span> <input name='roundsWon' type='number' min='0' value='${hero?.roundsWon ?? 0}'></div>
            <div class='hero-attr'><span>💥 Daño:</span> <input name='damage' type='number' min='0' value='${hero?.damage ?? 0}'></div>
            <div class='hero-attr'><span>🤝 Afinidad:</span> <input name='teamAffinity' type='number' min='0' value='${hero?.teamAffinity ?? 0}'></div>
            <div class='hero-attr'><span>🔋 Energía:</span> <input name='energyCost' type='number' min='0' value='${hero?.energyCost ?? 20}'></div>
            <div class='hero-attr'><span>🛡️ Reducción:</span> <input name='damageReduction' type='number' min='0' value='${hero?.damageReduction ?? 0}'></div>
          ` : ''}
        </div>
        <div class='hero-detail-footer'>
          <button type='submit' class='save'>${hero?._id ? 'Guardar Cambios' : 'Crear Héroe'}</button>
          <button type='button' class='cancel'>Cancelar</button>
          ${!hero && isAdmin ? `<button type='button' class='character-select-btn' onclick="showCharacterSelector()">🎮 Seleccionar del Juego</button>` : ''}
        </div>
      </form>
    </div>
  `;

  document.getElementById('heroForm').onsubmit = e => {
    e.preventDefault();
    const form = e.target;
    let data = Object.fromEntries(new FormData(form));
    
    // Convertir campos numéricos y booleanos
    data.health = Number(data.health);
    data.stamina = Number(data.stamina);
    data.speed = Number(data.speed);
    data.critChance = Number(data.critChance);
    data.isAlive = data.isAlive === 'true';
    data.roundsWon = Number(data.roundsWon);
    data.damage = Number(data.damage);
    data.teamAffinity = Number(data.teamAffinity);
    data.energyCost = Number(data.energyCost);
    data.damageReduction = Number(data.damageReduction);
    data.attack = Number(data.attack);
    data.defense = Number(data.defense);
    
    onSubmit(data);
  };
  
  document.querySelector('.cancel').onclick = onCancel;

  // Función para volver al selector de personajes
  window.showCharacterSelector = () => {
    renderCharacterSelectionForm({ onSubmit, onCancel });
  };
}
