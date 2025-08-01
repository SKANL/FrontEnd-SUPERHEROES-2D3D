// Renderer para villanos con selector de personajes del juego
import { logout } from '../auth/utils.js';
import { CharacterSelector } from '../components/CharacterSelector.js';
import { createApiDataFromGameCharacter } from '../../characters/GameCharacters.js';

document.getElementById('logoutBtn')?.addEventListener('click', logout);

export function renderVillainsList(villains, { onDetail, onEdit, onDelete, isAdmin, userId }) {
  const villainsList = document.getElementById('villainsList');
  villainsList.innerHTML = '';
  if (!villains.length) {
    villainsList.innerHTML = '<p>No hay villanos registrados.</p>';
    return;
  }
  villains.forEach(villain => {
    const card = document.createElement('div');
    card.className = 'villain-card';
    const villainId = villain._id || villain.id;
    if (!villainId) {
      console.warn('Villain missing ID:', villain);
    }

    // Mostrar información del personaje del juego si está disponible
    const gameCharacterInfo = villain.gameCharacterId ? 
      `<div class="game-character-info">
        <span class="game-character-badge">🎮 ${villain.gameCharacterName || villain.gameCharacterId}</span>
        <span class="character-type-badge">${villain.characterType || 'unknown'}</span>
      </div>` : '';

    card.innerHTML = `
      ${gameCharacterInfo}
      <div class="villain-info">
        <strong>${villain.name}</strong> <span>(${villain.alias})</span><br>
        <small>Ciudad: ${villain.city} | Equipo: ${villain.team}</small><br>
        <small>Salud: ${villain.health} | Stamina: ${villain.stamina} | Velocidad: ${villain.speed}</small><br>
        <small>Crítico: ${villain.critChance}% | Estado: ${villain.status} | Especial: ${villain.specialAbility}</small>
      </div>
      <div class="villain-actions">
        <button class="detail">Ver Detalle</button>
        ${isAdmin || villain.ownerId === userId ? `<button class="edit">Editar</button>` : ''}
        ${isAdmin || villain.ownerId === userId ? `<button class="delete">Eliminar</button>` : ''}
      </div>
    `;
    card.querySelector('.detail').onclick = () => onDetail(villainId);
    if (isAdmin || villain.ownerId === userId) {
      card.querySelector('.edit').onclick = () => onEdit({ ...villain, _id: villainId });
      card.querySelector('.delete').onclick = () => onDelete(villainId);
    }
    villainsList.appendChild(card);
  });
}

export function renderVillainDetail(villain, onClose) {
  const villainDetailContainer = document.getElementById('villainDetailContainer');
  villainDetailContainer.classList.remove('hidden');

  // Información adicional del personaje del juego
  const gameCharacterSection = villain.gameCharacterId ? 
    `<div class='game-character-section'>
      <h4>🎮 Personaje del Juego</h4>
      <div class='villain-attr'><span>📁 Personaje:</span> ${villain.gameCharacterName || villain.gameCharacterId}</div>
      <div class='villain-attr'><span>🎭 Tipo:</span> ${villain.characterType || 'unknown'}</div>
      <div class='villain-attr'><span>📂 Sprites:</span> ${villain.spriteFolder || 'default'}</div>
    </div>` : '';

  villainDetailContainer.innerHTML = `
    <div class='villain-detail-card'>
      <div class='villain-detail-header'>
        <div class='villain-avatar'>
          <span class='villain-icon'>🦹‍♂️</span>
        </div>
        <div>
          <h2>${villain.name}</h2>
          <h3 class='villain-alias'>${villain.alias}</h3>
        </div>
      </div>
      <div class='villain-detail-body'>
        ${gameCharacterSection}
        <div class='villain-attr'><span>🌆 Ciudad:</span> ${villain.city}</div>
        <div class='villain-attr'><span>🛡️ Equipo:</span> ${villain.team}</div>
        <div class='villain-attr'><span>❤️ Salud:</span> ${villain.health}</div>
        <div class='villain-attr'><span>⚡ Stamina:</span> ${villain.stamina}</div>
        <div class='villain-attr'><span>🏃‍♂️ Velocidad:</span> ${villain.speed}</div>
        <div class='villain-attr'><span>🎯 Crítico:</span> ${villain.critChance}%</div>
        <div class='villain-attr'><span>🔄 Estado:</span> ${villain.status}</div>
        <div class='villain-attr'><span>✨ Especial:</span> ${villain.specialAbility}</div>
        <div class='villain-attr'><span>🟢 Vivo:</span> ${villain.isAlive ? 'Sí' : 'No'}</div>
        <div class='villain-attr'><span>🏆 Rounds Ganados:</span> ${villain.roundsWon}</div>
        <div class='villain-attr'><span>💥 Daño:</span> ${villain.damage}</div>
        <div class='villain-attr'><span>🤝 Afinidad Equipo:</span> ${villain.teamAffinity}</div>
        <div class='villain-attr'><span>🔋 Costo Energía:</span> ${villain.energyCost}</div>
        <div class='villain-attr'><span>🛡️ Reducción Daño:</span> ${villain.damageReduction}</div>
        <div class='villain-attr'><span>⚔️ Ataque:</span> ${villain.attack}</div>
        <div class='villain-attr'><span>🛡️ Defensa:</span> ${villain.defense}</div>
      </div>
      <div class='villain-detail-footer'>
        <button class='cancel'>Cerrar</button>
      </div>
    </div>
  `;
  document.querySelector('#villainDetailContainer .cancel').onclick = onClose;
}

export function renderVillainForm({ villain, isAdmin, isOwner, onSubmit, onCancel }) {
  const villainFormContainer = document.getElementById('villainFormContainer');
  villainFormContainer.classList.remove('hidden');

  if (!villain) {
    // Modo creación - mostrar selector de personajes
    renderCharacterSelectionForm({ onSubmit, onCancel });
  } else {
    // Modo edición - mostrar formulario tradicional
    renderTraditionalForm({ villain, isAdmin, isOwner, onSubmit, onCancel });
  }
}

function renderCharacterSelectionForm({ onSubmit, onCancel }) {
  const villainFormContainer = document.getElementById('villainFormContainer');
  
  villainFormContainer.innerHTML = `
    <div class='character-selection-container'>
      <div class='selection-header'>
        <h2>🦹‍♂️ Crear Nuevo Villano</h2>
        <p>Selecciona un personaje del juego para crear tu villano</p>
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
    faction: 'villain',
    multiSelect: false,
    allowCustomization: true,
    onSelect: (character) => {
      console.log('Personaje seleccionado:', character);
    },
    onConfirm: (character, customData) => {
      if (character && customData) {
        // Crear datos para la API basados en el personaje del juego
        const apiData = createApiDataFromGameCharacter(character, customData, 'villain');
        
        // Validar que los campos requeridos estén completos
        if (!apiData.name || !apiData.alias) {
          alert('Por favor, completa el nombre y alias del villano');
          return;
        }
        
        console.log('Datos a enviar a la API:', apiData);
        onSubmit(apiData);
      }
    }
  });

  selector.render();

  // Agregar botón de volver al modo tradicional (para admins)
  villainFormContainer.querySelector('.selection-header').insertAdjacentHTML('beforeend', `
    <button class="traditional-mode-btn" onclick="showTraditionalForm()">
      📝 Crear sin personaje del juego
    </button>
  `);

  // Función para mostrar formulario tradicional
  window.showTraditionalForm = () => {
    renderTraditionalForm({ villain: null, isAdmin: true, isOwner: true, onSubmit, onCancel });
  };
}

function renderTraditionalForm({ villain, isAdmin, isOwner, onSubmit, onCancel }) {
  const villainFormContainer = document.getElementById('villainFormContainer');
  
  villainFormContainer.innerHTML = `
    <div class='villain-detail-card'>
      <div class='villain-detail-header'>
        <div class='villain-avatar'>
          <span class='villain-icon'>${villain?._id ? '✏️' : '🦹‍♂️'}</span>
        </div>
        <div>
          <h2>${villain?._id ? 'Editar Villano' : 'Crear Villano (Modo Tradicional)'}</h2>
          <h3 class='villain-alias'>${villain?.alias || ''}</h3>
        </div>
      </div>
      <form id='villainForm'>
        <div class='villain-detail-body'>
          ${isAdmin ? `
            <div class='villain-attr'><span>🆔 Nombre:</span> <input name='name' required value='${villain?.name || ''}'></div>
            <div class='villain-attr'><span>🎭 Alias:</span> <input name='alias' required value='${villain?.alias || ''}'></div>
          ` : ''}
          
          <div class='villain-attr'><span>🌆 Ciudad:</span> <input name='city' required value='${villain?.city || ''}'></div>
          <div class='villain-attr'><span>🛡️ Equipo:</span> <input name='team' value='${villain?.team || ''}'></div>
          
          ${isAdmin ? `
            <div class='villain-attr'><span>❤️ Salud:</span> <input name='health' type='number' min='0' max='200' value='${villain?.health ?? 100}'></div>
            <div class='villain-attr'><span>⚔️ Ataque:</span> <input name='attack' type='number' min='0' max='200' value='${villain?.attack ?? 75}'></div>
            <div class='villain-attr'><span>🛡️ Defensa:</span> <input name='defense' type='number' min='0' max='200' value='${villain?.defense ?? 45}'></div>
            <div class='villain-attr'><span>✨ Especial:</span> <input name='specialAbility' value='${villain?.specialAbility || ''}'></div>
          ` : ''}
          
          <div class='villain-attr'><span>⚡ Stamina:</span> <input name='stamina' type='number' min='0' max='200' value='${villain?.stamina ?? 100}'></div>
          <div class='villain-attr'><span>🏃‍♂️ Velocidad:</span> <input name='speed' type='number' min='0' max='200' value='${villain?.speed ?? 60}'></div>
          <div class='villain-attr'><span>🎯 Crítico:</span> <input name='critChance' type='number' min='0' max='100' value='${villain?.critChance ?? 20}'></div>
          <div class='villain-attr'><span>🔄 Estado:</span> <input name='status' value='${villain?.status || 'normal'}'></div>
          
          ${isAdmin ? `
            <div class='villain-attr'><span>🟢 Vivo:</span> <select name='isAlive'><option value='true' ${villain?.isAlive !== false ? 'selected' : ''}>Sí</option><option value='false' ${villain?.isAlive === false ? 'selected' : ''}>No</option></select></div>
            <div class='villain-attr'><span>🏆 Rounds:</span> <input name='roundsWon' type='number' min='0' value='${villain?.roundsWon ?? 0}'></div>
            <div class='villain-attr'><span>💥 Daño:</span> <input name='damage' type='number' min='0' value='${villain?.damage ?? 0}'></div>
            <div class='villain-attr'><span>🤝 Afinidad:</span> <input name='teamAffinity' type='number' min='0' value='${villain?.teamAffinity ?? 0}'></div>
            <div class='villain-attr'><span>🔋 Energía:</span> <input name='energyCost' type='number' min='0' value='${villain?.energyCost ?? 20}'></div>
            <div class='villain-attr'><span>🛡️ Reducción:</span> <input name='damageReduction' type='number' min='0' value='${villain?.damageReduction ?? 0}'></div>
          ` : ''}
        </div>
        <div class='villain-detail-footer'>
          <button type='submit' class='save'>${villain?._id ? 'Guardar Cambios' : 'Crear Villano'}</button>
          <button type='button' class='cancel'>Cancelar</button>
          ${!villain && isAdmin ? `<button type='button' class='character-select-btn' onclick="showCharacterSelector()">🎮 Seleccionar del Juego</button>` : ''}
        </div>
      </form>
    </div>
  `;

  document.getElementById('villainForm').onsubmit = e => {
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
