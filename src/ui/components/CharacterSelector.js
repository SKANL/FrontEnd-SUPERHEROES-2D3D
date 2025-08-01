// Selector de personajes estilo juego de peleas
import { GAME_CHARACTERS, getCharactersByFaction, createApiDataFromGameCharacter } from '../../characters/GameCharacters.js';

export class CharacterSelector {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.options = {
      faction: options.faction || 'hero', // 'hero', 'villain', o 'all'
      multiSelect: options.multiSelect || false,
      onSelect: options.onSelect || (() => {}),
      onConfirm: options.onConfirm || (() => {}),
      showStats: options.showStats !== false,
      allowCustomization: options.allowCustomization !== false
    };
    this.selectedCharacters = [];
    this.currentCharacter = null;
  }

  render() {
    const characters = this.options.faction === 'all' 
      ? Object.values(GAME_CHARACTERS)
      : getCharactersByFaction(this.options.faction);

    this.container.innerHTML = `
      <div class="character-selector">
        <div class="character-selector-header">
          <h2>Selecciona tu ${this.options.faction === 'hero' ? 'Héroe' : 'Villano'}</h2>
          <div class="faction-indicator ${this.options.faction}">
            ${this.options.faction === 'hero' ? '🦸‍♂️ HÉROES' : '🦹‍♂️ VILLANOS'}
          </div>
        </div>
        
        <div class="character-grid">
          ${characters.map(char => this.renderCharacterCard(char)).join('')}
        </div>
        
        <div class="character-preview ${this.currentCharacter ? 'active' : ''}">
          ${this.currentCharacter ? this.renderCharacterPreview(this.currentCharacter) : '<div class="no-selection">Selecciona un personaje para ver detalles</div>'}
        </div>
        
        ${this.options.allowCustomization ? this.renderCustomizationPanel() : ''}
        
        <div class="selector-controls">
          <button class="btn-cancel">Cancelar</button>
          <button class="btn-confirm" ${!this.currentCharacter ? 'disabled' : ''}>
            ${this.options.multiSelect ? 'Agregar Personaje' : 'Confirmar Selección'}
          </button>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderCharacterCard(character) {
    const isSelected = this.selectedCharacters.some(sel => sel.id === character.id);
    const canSelect = this.options.faction === 'all' || character.factions.includes(this.options.faction);
    
    return `
      <div class="character-card ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}" 
           data-character-id="${character.id}">
        <div class="character-portrait">
          <img src="${character.portraits[0]}" alt="${character.displayName}" 
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+JHtjaGFyYWN0ZXIuZGlzcGxheU5hbWV9PC90ZXh0Pjwvc3ZnPg=='" />
        </div>
        <div class="character-info">
          <h3>${character.displayName}</h3>
          <p class="character-type">${character.type}</p>
          <div class="character-stats-mini">
            <span>❤️${character.defaultStats.health}</span>
            <span>⚔️${character.defaultStats.attack}</span>
            <span>🛡️${character.defaultStats.defense}</span>
            <span>⚡${character.defaultStats.speed}</span>
          </div>
        </div>
        ${!canSelect ? '<div class="faction-lock">🔒</div>' : ''}
        ${isSelected ? '<div class="selection-check">✓</div>' : ''}
      </div>
    `;
  }

  renderCharacterPreview(character) {
    return `
      <div class="character-preview-content">
        <div class="preview-header">
          <div class="preview-portrait">
            <img src="${character.portraits[0]}" alt="${character.displayName}" />
          </div>
          <div class="preview-info">
            <h2>${character.displayName}</h2>
            <h3>${character.type.toUpperCase()}</h3>
            <p class="character-description">${character.description}</p>
            <div class="character-lore">${character.lore}</div>
          </div>
        </div>
        
        ${this.options.showStats ? `
        <div class="preview-stats">
          <h4>Estadísticas</h4>
          <div class="stats-grid">
            <div class="stat">
              <span class="stat-icon">❤️</span>
              <span class="stat-name">Salud</span>
              <div class="stat-bar">
                <div class="stat-fill" style="width: ${character.defaultStats.health}%"></div>
                <span class="stat-value">${character.defaultStats.health}</span>
              </div>
            </div>
            <div class="stat">
              <span class="stat-icon">⚔️</span>
              <span class="stat-name">Ataque</span>
              <div class="stat-bar">
                <div class="stat-fill" style="width: ${character.defaultStats.attack}%"></div>
                <span class="stat-value">${character.defaultStats.attack}</span>
              </div>
            </div>
            <div class="stat">
              <span class="stat-icon">🛡️</span>
              <span class="stat-name">Defensa</span>
              <div class="stat-bar">
                <div class="stat-fill" style="width: ${character.defaultStats.defense}%"></div>
                <span class="stat-value">${character.defaultStats.defense}</span>
              </div>
            </div>
            <div class="stat">
              <span class="stat-icon">⚡</span>
              <span class="stat-name">Velocidad</span>
              <div class="stat-bar">
                <div class="stat-fill" style="width: ${character.defaultStats.speed}%"></div>
                <span class="stat-value">${character.defaultStats.speed}</span>
              </div>
            </div>
            <div class="stat">
              <span class="stat-icon">🎯</span>
              <span class="stat-name">Crítico</span>
              <div class="stat-bar">
                <div class="stat-fill" style="width: ${character.defaultStats.critChance}%"></div>
                <span class="stat-value">${character.defaultStats.critChance}%</span>
              </div>
            </div>
            <div class="stat">
              <span class="stat-icon">✨</span>
              <span class="stat-name">Especial</span>
              <div class="stat-bar">
                <span class="special-ability">${character.defaultStats.specialAbility}</span>
              </div>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    `;
  }

  renderCustomizationPanel() {
    return `
      <div class="customization-panel ${this.currentCharacter ? 'active' : ''}">
        <h4>Personalización</h4>
        <div class="custom-fields">
          <div class="field-group">
            <label for="custom-name">Nombre:</label>
            <input type="text" id="custom-name" placeholder="Nombre del personaje" />
          </div>
          <div class="field-group">
            <label for="custom-alias">Alias:</label>
            <input type="text" id="custom-alias" placeholder="Alias o apodo" />
          </div>
          <div class="field-group">
            <label for="custom-city">Ciudad:</label>
            <select id="custom-city">
              <option value="">Seleccionar ciudad...</option>
              ${this.currentCharacter ? this.currentCharacter.cities.map(city => 
                `<option value="${city}">${city}</option>`
              ).join('') : ''}
            </select>
          </div>
          <div class="field-group">
            <label for="custom-team">Equipo:</label>
            <input type="text" id="custom-team" placeholder="Nombre del equipo" />
          </div>
          ${this.currentCharacter && this.currentCharacter.portraits && this.currentCharacter.portraits.length > 1 ? `
            <div class="field-group">
              <label for="custom-portrait">Portada:</label>
              <div class="portrait-selector">
                ${this.currentCharacter.portraits.map((portrait, index) => `
                  <div class="portrait-option ${index === 0 ? 'selected' : ''}" data-portrait="${portrait}">
                    <img src="${portrait}" alt="Portada ${index + 1}" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                    <div class="portrait-fallback" style="display:none;">🖼️</div>
                    <span class="portrait-number">${index + 1}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Selección de personajes
    this.container.querySelectorAll('.character-card').forEach(card => {
      card.addEventListener('click', () => {
        const characterId = card.dataset.characterId;
        const character = Object.values(GAME_CHARACTERS).find(c => c.id === characterId);
        
        if (card.classList.contains('disabled')) return;
        
        if (this.options.multiSelect) {
          this.toggleCharacterSelection(character, card);
        } else {
          this.selectCharacter(character, card);
        }
      });
    });

    // Selección de portadas
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.portrait-option')) {
        const portraitOption = e.target.closest('.portrait-option');
        
        // Remover selección anterior
        this.container.querySelectorAll('.portrait-option').forEach(option => {
          option.classList.remove('selected');
        });
        
        // Seleccionar nueva portada
        portraitOption.classList.add('selected');
      }
    });

    // Botones de control
    this.container.querySelector('.btn-cancel').addEventListener('click', () => {
      this.options.onSelect(null);
    });

    this.container.querySelector('.btn-confirm').addEventListener('click', () => {
      if (this.currentCharacter || this.selectedCharacters.length > 0) {
        const customData = this.getCustomizationData();
        const result = this.options.multiSelect ? this.selectedCharacters : this.currentCharacter;
        this.options.onConfirm(result, customData);
      }
    });
  }

  selectCharacter(character, cardElement) {
    // Remover selección anterior
    this.container.querySelectorAll('.character-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Seleccionar nuevo personaje
    cardElement.classList.add('selected');
    this.currentCharacter = character;

    // Actualizar preview
    const preview = this.container.querySelector('.character-preview');
    preview.innerHTML = this.renderCharacterPreview(character);
    preview.classList.add('active');

    // Actualizar panel de personalización
    if (this.options.allowCustomization) {
      const customPanel = this.container.querySelector('.customization-panel');
      customPanel.innerHTML = this.renderCustomizationPanel().replace(/<div class="customization-panel[^>]*>|<\/div>$/g, '');
      customPanel.classList.add('active');
    }

    // Habilitar botón de confirmar
    this.container.querySelector('.btn-confirm').disabled = false;

    this.options.onSelect(character);
  }

  toggleCharacterSelection(character, cardElement) {
    const isSelected = this.selectedCharacters.some(sel => sel.id === character.id);
    
    if (isSelected) {
      this.selectedCharacters = this.selectedCharacters.filter(sel => sel.id !== character.id);
      cardElement.classList.remove('selected');
    } else {
      this.selectedCharacters.push(character);
      cardElement.classList.add('selected');
    }

    this.container.querySelector('.btn-confirm').disabled = this.selectedCharacters.length === 0;
  }

  getCustomizationData() {
    if (!this.options.allowCustomization) return {};
    
    // Obtener portada seleccionada
    const selectedPortrait = this.container.querySelector('.portrait-option.selected');
    const portraitUrl = selectedPortrait ? selectedPortrait.dataset.portrait : 
                       (this.currentCharacter && this.currentCharacter.portraits ? this.currentCharacter.portraits[0] : null);
    
    return {
      name: this.container.querySelector('#custom-name')?.value || '',
      alias: this.container.querySelector('#custom-alias')?.value || '',
      city: this.container.querySelector('#custom-city')?.value || '',
      team: this.container.querySelector('#custom-team')?.value || '',
      selectedPortrait: portraitUrl
    };
  }
}
