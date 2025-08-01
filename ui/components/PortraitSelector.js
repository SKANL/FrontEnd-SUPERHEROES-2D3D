// Selector de portadas para edición de personajes existentes
import { GAME_CHARACTERS } from '../../characters/GameCharacters.js';

export class PortraitSelector {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.options = {
      character: options.character || null,
      currentPortrait: options.currentPortrait || null,
      onPortraitSelect: options.onPortraitSelect || (() => {}),
      ...options
    };
    this.selectedPortrait = this.options.currentPortrait;
  }

  render() {
    if (!this.options.character) {
      this.container.innerHTML = '<p>No se puede mostrar selector: personaje no encontrado</p>';
      return;
    }

    const character = GAME_CHARACTERS[this.options.character];
    if (!character || !character.portraits || character.portraits.length <= 1) {
      this.container.innerHTML = '<p>Este personaje no tiene portadas adicionales disponibles</p>';
      return;
    }

    this.container.innerHTML = `
      <div class="portrait-selector-widget">
        <h4>Cambiar Portada</h4>
        <div class="portrait-grid">
          ${character.portraits.map((portrait, index) => `
            <div class="portrait-option ${portrait === this.selectedPortrait ? 'selected' : ''}" 
                 data-portrait="${portrait}" data-index="${index}">
              <img src="${portrait}" alt="Portada ${index + 1}" 
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <div class="portrait-fallback" style="display:none;">🖼️</div>
              <span class="portrait-number">${index + 1}</span>
              ${portrait === this.selectedPortrait ? '<div class="selected-indicator">✓</div>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.container.addEventListener('click', (e) => {
      const option = e.target.closest('.portrait-option');
      if (option) {
        // Remover selección anterior
        this.container.querySelectorAll('.portrait-option').forEach(opt => {
          opt.classList.remove('selected');
          const indicator = opt.querySelector('.selected-indicator');
          if (indicator) indicator.remove();
        });

        // Seleccionar nueva portada
        option.classList.add('selected');
        option.insertAdjacentHTML('beforeend', '<div class="selected-indicator">✓</div>');
        
        this.selectedPortrait = option.dataset.portrait;
        this.options.onPortraitSelect(this.selectedPortrait);
      }
    });
  }

  getSelectedPortrait() {
    return this.selectedPortrait;
  }

  setSelectedPortrait(portrait) {
    this.selectedPortrait = portrait;
    this.render();
  }
}
