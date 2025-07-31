// Clase para manejar la barra de vida de un jugador
export class HealthBar {
    constructor(barElement) {
        this.barElement = barElement;
        this.maxHealth = 100;
        this.currentHealth = 100;
        this.update();
    }

    setHealth(health) {
        this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
        this.update();
    }

    takeDamage(amount) {
        this.setHealth(this.currentHealth - amount);
    }

    heal(amount) {
        this.setHealth(this.currentHealth + amount);
    }

    update() {
        const percent = (this.currentHealth / this.maxHealth) * 100;
        this.barElement.style.width = percent + '%';
    }
}
