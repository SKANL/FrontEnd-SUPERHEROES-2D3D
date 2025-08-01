// Interfaz visual y lógica específica para la batalla
export default class BattleInterface {
  constructor(containerId) {
    this.root = document.getElementById(containerId);
    if (!this.root) return;
    // HTML del HUD de batalla
    this.root.innerHTML = `
      <div class="round-info">
        <div id="roundTimer">99</div>
        <div class="round-wins">
          <span id="p1Wins" class="wins">○○○</span>
          <span id="p2Wins" class="wins">○○○</span>
        </div>
      </div>
      <div class="hud-bar health-p1">
        <div id="hp1" class="fill"></div>
        <div id="sp1" class="special-fill"></div>
      </div>
      <div class="hud-bar health-p2">
        <div id="hp2" class="fill"></div>
        <div id="sp2" class="special-fill"></div>
      </div>
      <div id="comboCounter" class="combo">Combo: 0</div>
    `;
    // Referencias a elementos
    this.timerEl = this.root.querySelector('#roundTimer');
    this.hpEls = [
      this.root.querySelector('#hp1'),
      this.root.querySelector('#hp2')
    ];
    this.spEls = [
      this.root.querySelector('#sp1'),
      this.root.querySelector('#sp2')
    ];
    this.comboEl = this.root.querySelector('#comboCounter');
    this.p1WinsEl = this.root.querySelector('#p1Wins');
    this.p2WinsEl = this.root.querySelector('#p2Wins');
    // Iniciar temporizador
    this.startTimer(99);
    // Audio: música de fondo
    this.bgm = new Audio('/sounds/bgm.mp3');
    this.bgm.loop = true;
    this.bgm.volume = 0.3;
    this.bgm.play().catch(() => {});
  }

  startTimer(seconds) {
    this.time = seconds;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.time--;
      this.timerEl.textContent = String(this.time).padStart(2, '0');
      if (this.time <= 0) clearInterval(this.timerInterval);
    }, 1000);
  }

  updateHealth(playerIndex, percent) {
    const el = this.hpEls[playerIndex];
    if (el) el.style.width = percent + '%';
  }

  updateSpecial(playerIndex, percent) {
    const el = this.spEls[playerIndex];
    if (el) el.style.width = percent + '%';
  }

  updateCombo(count) {
    if (this.comboEl) this.comboEl.textContent = `Combo: ${count}`;
  }

  updateRoundWins(p1, p2) {
    if (this.p1WinsEl) this.p1WinsEl.textContent = '●'.repeat(p1) + '○'.repeat(3 - p1);
    if (this.p2WinsEl) this.p2WinsEl.textContent = '●'.repeat(p2) + '○'.repeat(3 - p2);
  }
  
  showDamage(playerIndex, amount) {
    const popup = document.createElement('span');
    popup.className = 'damage-popup';
    popup.textContent = `-${amount}`;
    // posicionar cerca de la barra de vida del jugador
    const barEl = this.hpEls[playerIndex];
    if (barEl) {
      const rect = barEl.getBoundingClientRect();
      popup.style.left = `${rect.left + rect.width / 2}px`;
      popup.style.top = `${rect.top - 20}px`;
    }
    this.root.appendChild(popup);
    // reproducir sonido de impacto
    if (!this.hitAudio) {
      this.hitAudio = new Audio('/sounds/hit.wav');
      this.hitAudio.volume = 0.8;
    }
    this.hitAudio.currentTime = 0;
    this.hitAudio.play().catch(() => {});
    // sacudida de cámara si es golpe fuerte
    if (amount > 15) {
      const canvas = document.getElementById('spriteCanvas');
      if (canvas) {
        canvas.classList.add('shake');
        setTimeout(() => canvas.classList.remove('shake'), 300);
      }
    }
    // animar y eliminar popup
    setTimeout(() => {
      popup.classList.add('fade-out');
      popup.addEventListener('transitionend', () => popup.remove());
    }, 500);
  }
}
