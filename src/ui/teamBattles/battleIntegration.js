// Integración entre la interfaz de batalla y el sistema de teamBattles
import { Fighter } from '../../characters/Fighter.js';
import { SpriteLoader } from '../../characters/SpriteLoader.js';
import { Game } from '../../core/Game.js';
import BattleInterface from '../battle/interface.js';
import { getToken } from '../auth/utils.js';
import { 
    getBattleState, 
    sendAttack, 
    finishTeamBattle,
    startTeamBattle
} from './teamBattleApi.js';

export class TeamBattleGame extends Game {
    constructor(battleId, heroes, villains) {
        super();
        this.battleId = battleId;
        this.heroes = heroes || [];
        this.villains = villains || [];
        this.playerSide = 'hero'; // Por defecto, el jugador controla a los héroes
        this.activeHero = null;
        this.activeVillain = null;
        this.isGameActive = false;
        this.lastApiSync = 0;
        this.syncInterval = 5000; // Aumentado a 5 segundos para reducir carga en API
        this.token = getToken();
        
        // Debug: Mostrar qué datos se recibieron en el constructor
        console.log('=== TEAMGAMEBATTLE CONSTRUCTOR ===');
        console.log('BattleId:', battleId);
        console.log('Heroes recibidos:', heroes);
        console.log('Villains recibidos:', villains);
        console.log('Tipo heroes:', typeof heroes);
        console.log('Tipo villains:', typeof villains);
        console.log('Es heroes array?:', Array.isArray(heroes));
        console.log('Es villains array?:', Array.isArray(villains));
        
        // Validación temprana con mensajes más descriptivos
        if (!battleId) {
            throw new Error('ID de batalla requerido para inicializar el juego');
        }
        
        if (!heroes && !villains) {
            console.warn('No se recibieron datos de personajes, se usarán datos por defecto');
            this.heroes = [{ id: 'default-hero', name: 'Héroe por Defecto', health: 100 }];
            this.villains = [{ id: 'default-villain', name: 'Villano por Defecto', health: 100 }];
        }
        
        // Asegurar que la referencia global esté configurada
        window.game = this;
    }

    async init() {
        try {
            console.log('Iniciando TeamBattleGame...');
            
            // Verificar que los elementos DOM existen
            this.bgCanvas = document.getElementById('bgCanvas');
            this.spriteCanvas = document.getElementById('spriteCanvas');
            this.ui = document.getElementById('ui');
            
            if (!this.bgCanvas || !this.spriteCanvas || !this.ui) {
                throw new Error('Elementos DOM requeridos no encontrados');
            }
            
            // Inicializar renderizadores
            await this.threeRenderer.init();
            await this.spriteRenderer.init();
            
            // Crear interfaz de batalla
            this.battleUI = new BattleInterface('ui');
            
            // Configurar personajes de la batalla
            await this.setupBattleCharacters();
            
            // Configurar controles DESPUÉS de que los fighters estén listos
            this.setupApiControls();
            
            this.isGameActive = true;
            
            // Iniciar sincronización con la API
            this.syncWithApi();
            
            // Iniciar el loop del juego
            this.loop();
            
            console.log('TeamBattleGame iniciado exitosamente');
        } catch (error) {
            console.error('Error en init de TeamBattleGame:', error);
            throw error;
        }
    }

    setupApiControls() {
        // Deshabilitar controles originales si existen
        if (this.controls && this.controls.disable) {
            this.controls.disable();
        }
        
        // Crear nuevos controles API
        const ApiControls = window.ApiControls || class {
            constructor() { console.warn('ApiControls no disponible'); }
            init() {}
            enable() {}
            disable() {}
        };
        
        this.controls = new ApiControls(this);
        this.controls.init(this.fighters);
    }

    async setupBattleCharacters() {
        try {
            console.log('Configurando personajes de batalla...');
            console.log('Datos completos recibidos:');
            console.log('- Heroes:', this.heroes);
            console.log('- Villains:', this.villains);
            console.log('- Tipos de datos:');
            console.log('  - Heroes tipo:', typeof this.heroes, 'es array:', Array.isArray(this.heroes));
            console.log('  - Villains tipo:', typeof this.villains, 'es array:', Array.isArray(this.villains));
            
            const loader = new SpriteLoader();
            
            // Validación más flexible de personajes
            let processedHeroes = [];
            let processedVillains = [];
            
            // Normalizar heroes - puede venir como array o como objeto individual
            if (Array.isArray(this.heroes)) {
                processedHeroes = this.heroes;
            } else if (this.heroes && typeof this.heroes === 'object') {
                processedHeroes = [this.heroes];
            }
            
            // Normalizar villains - puede venir como array o como objeto individual
            if (Array.isArray(this.villains)) {
                processedVillains = this.villains;
            } else if (this.villains && typeof this.villains === 'object') {
                processedVillains = [this.villains];
            }
            
            // Validar que tenemos al menos un personaje de cada tipo
            if (processedHeroes.length === 0 || processedVillains.length === 0) {
                console.error('Error: No hay suficientes personajes');
                console.log('Cantidad de héroes procesados:', processedHeroes.length);
                console.log('Cantidad de villanos procesados:', processedVillains.length);
                throw new Error(`Faltan personajes: ${processedHeroes.length} héroes, ${processedVillains.length} villanos`);
            }
            
            // Actualizar las referencias procesadas
            this.heroes = processedHeroes;
            this.villains = processedVillains;
            
            // Seleccionar el primer héroe y villano disponibles
            this.activeHero = this.heroes[0];
            this.activeVillain = this.villains[0];
            
            // Validar estructura de los personajes (más flexible)
            if (!this.activeHero || !this.activeHero.id) {
                console.warn('Héroe no tiene ID, asignando ID temporal');
                this.activeHero.id = this.activeHero.id || 'temp-hero-1';
            }
            
            if (!this.activeVillain || !this.activeVillain.id) {
                console.warn('Villano no tiene ID, asignando ID temporal');
                this.activeVillain.id = this.activeVillain.id || 'temp-villain-1';
            }

            console.log("Cargando sprites para batalla de equipo...");
            console.log("Héroe activo:", this.activeHero);
            console.log("Villano activo:", this.activeVillain);
            
            // CARGA DINÁMICA DE SPRITES BASADA EN DATOS DE LA BD
            let heroSprites, villainSprites;
            
            try {
                // Cargar sprites del héroe según su gameCharacterId o spriteFolder
                heroSprites = await this.loadCharacterSprites(this.activeHero, loader, 'hero');
            } catch (error) {
                console.warn('Error cargando sprites específicos del héroe, usando Baraka por defecto:', error);
                heroSprites = await loader.loadBarakaSprites();
            }
            
            try {
                // Cargar sprites del villano según su gameCharacterId o spriteFolder
                villainSprites = await this.loadCharacterSprites(this.activeVillain, loader, 'villain');
            } catch (error) {
                console.warn('Error cargando sprites específicos del villano, usando Cyrax por defecto:', error);
                villainSprites = await loader.loadPlayer2Sprites();
            }
            
            if (!heroSprites || !villainSprites) {
                throw new Error('Error cargando sprites de personajes');
            }
            
            // Posiciones iniciales
            const canvasWidth = window.innerWidth;
            
            // Esperar a que el ThreeRenderer esté completamente inicializado
            if (!this.threeRenderer.arena) {
                throw new Error('Arena 3D no está inicializada');
            }
            
            const groundWorldY = this.threeRenderer.arena.position.y + 0.3;
            const groundScreenY = this.threeRenderer.getScreenYFromWorldY(groundWorldY);
            const p1x = canvasWidth * 0.3;
            const p2x = canvasWidth * 0.7;
            
            console.log('Posiciones calculadas:', { p1x, p2x, groundScreenY });
            
            // Crear luchadores con datos del API
            this.fighters = [
                new Fighter(p1x, groundScreenY, heroSprites, this.battleUI, 0),
                new Fighter(p2x, groundScreenY, villainSprites, this.battleUI, 1)
            ];
            
            // Configurar salud y atributos basados en los datos del API
            if (this.activeHero) {
                this.fighters[0].maxHealth = this.activeHero.health || this.activeHero.power || 100;
                this.fighters[0].health = this.activeHero.health || this.activeHero.power || 100;
                this.fighters[0].apiCharacterId = this.activeHero.id;
                this.fighters[0].characterType = 'hero';
                this.fighters[0].characterName = this.activeHero.name || 'Héroe';
                console.log('Héroe configurado:', this.fighters[0]);
            }
            
            if (this.activeVillain) {
                this.fighters[1].maxHealth = this.activeVillain.health || this.activeVillain.power || 100;
                this.fighters[1].health = this.activeVillain.health || this.activeVillain.power || 100; 
                this.fighters[1].apiCharacterId = this.activeVillain.id;
                this.fighters[1].characterType = 'villain';
                this.fighters[1].characterName = this.activeVillain.name || 'Villano';
                console.log('Villano configurado:', this.fighters[1]);
            }
            
            console.log('Personajes configurados exitosamente');
        } catch (error) {
            console.error('Error en setupBattleCharacters:', error);
            throw error;
        }
    }

    /**
     * Cargar sprites de un personaje específico basándose en sus datos de la BD
     * @param {Object} character - Datos del personaje desde la API
     * @param {SpriteLoader} loader - Instancia del sprite loader
     * @param {string} type - 'hero' o 'villain'
     * @returns {Promise<Object>} - Sprites cargados
     */
    async loadCharacterSprites(character, loader, type) {
        console.log(`=== CARGANDO SPRITES PARA ${type.toUpperCase()} ===`);
        console.log('Datos del personaje:', character);
        
        // Lista de intentos en orden de prioridad
        const loadAttempts = [];
        
        // Prioridad 1: spriteFolder
        if (character.spriteFolder) {
            loadAttempts.push({
                method: 'spriteFolder',
                value: character.spriteFolder,
                description: `sprites folder: ${character.spriteFolder}`
            });
        }
        
        // Prioridad 2: gameCharacterName + "Complete Edicion"
        if (character.gameCharacterName) {
            loadAttempts.push({
                method: 'gameCharacterName_complete',
                value: `${character.gameCharacterName} Complete Edicion`,
                description: `gameCharacterName completo: ${character.gameCharacterName} Complete Edicion`
            });
            
            loadAttempts.push({
                method: 'gameCharacterName',
                value: character.gameCharacterName,
                description: `gameCharacterName: ${character.gameCharacterName}`
            });
        }
        
        // Prioridad 3: gameCharacterId mapeado
        if (character.gameCharacterId) {
            const characterMap = {
                'baraka': 'Baraka Complete Edicion',
                'cyrax': 'Cyrax Complete Edicion',
                'Baraka': 'Baraka Complete Edicion',
                'Cyrax': 'Cyrax Complete Edicion'
            };
            
            const mappedFolder = characterMap[character.gameCharacterId];
            if (mappedFolder) {
                loadAttempts.push({
                    method: 'gameCharacterId_mapped',
                    value: mappedFolder,
                    description: `gameCharacterId mapeado: ${character.gameCharacterId} -> ${mappedFolder}`
                });
            }
            
            loadAttempts.push({
                method: 'gameCharacterId',
                value: character.gameCharacterId,
                description: `gameCharacterId directo: ${character.gameCharacterId}`
            });
        }
        
        // Prioridad 4: Detección por nombre/alias
        const searchTerms = [character.name, character.alias, character.characterName]
            .filter(term => term && typeof term === 'string');
            
        for (const term of searchTerms) {
            if (term.toLowerCase().includes('baraka')) {
                loadAttempts.push({
                    method: 'name_detection_baraka',
                    value: 'Baraka Complete Edicion',
                    description: `detectado Baraka en: ${term}`
                });
            }
            
            if (term.toLowerCase().includes('cyrax')) {
                loadAttempts.push({
                    method: 'name_detection_cyrax',
                    value: 'Cyrax Complete Edicion',
                    description: `detectado Cyrax en: ${term}`
                });
            }
        }
        
        // Intentar cada método en orden
        for (const attempt of loadAttempts) {
            console.log(`Intentando cargar sprites por ${attempt.description}`);
            try {
                const sprites = await loader.loadSpritesWithFallback(attempt.value);
                console.log(`✓ Sprites cargados exitosamente para ${type} usando: ${attempt.description}`);
                return sprites;
            } catch (error) {
                console.warn(`✗ Error con ${attempt.description}:`, error.message);
            }
        }
        
        // Fallback final por tipo
        console.log(`Usando fallback final para ${type}`);
        if (type === 'hero') {
            console.log('Cargando Baraka como fallback para héroe');
            return await loader.loadBarakaSprites();
        } else {
            console.log('Intentando cargar Cyrax para villano, con fallback a Baraka');
            try {
                return await loader.loadSpritesWithFallback('Cyrax Complete Edicion');
            } catch (error) {
                console.warn('Cyrax no disponible, usando Baraka para villano');
                return await loader.loadBarakaSprites();
            }
        }
    }

    async syncWithApi() {
        if (!this.isGameActive) return;
        
        const now = Date.now();
        if (now - this.lastApiSync > this.syncInterval) {
            try {
                const battleState = await getBattleState(this.battleId, this.token);
                this.updateGameFromApiState(battleState);
                this.lastApiSync = now;
            } catch (error) {
                console.error('Error sincronizando con la API:', error);
            }
        }
        
        // Programar próxima sincronización
        setTimeout(() => this.syncWithApi(), this.syncInterval);
    }

    updateGameFromApiState(state) {
        if (!state) return;
        
        // Actualizar estado de los personajes
        if (state.heroes && state.heroes.length > 0 && this.fighters[0]) {
            const heroData = state.heroes.find(h => h.id === this.fighters[0].apiCharacterId);
            if (heroData) {
                const prevHealth = this.fighters[0].health;
                this.fighters[0].health = heroData.health || 0;
                
                // Mostrar daño si ha perdido salud
                if (prevHealth > this.fighters[0].health) {
                    const damage = prevHealth - this.fighters[0].health;
                    this.battleUI.showDamage(0, damage);
                }
                
                // Actualizar UI
                const hpPercent = (this.fighters[0].health / this.fighters[0].maxHealth) * 100;
                this.battleUI.updateHealth(0, hpPercent);
            }
        }
        
        if (state.villains && state.villains.length > 0 && this.fighters[1]) {
            const villainData = state.villains.find(v => v.id === this.fighters[1].apiCharacterId);
            if (villainData) {
                const prevHealth = this.fighters[1].health;
                this.fighters[1].health = villainData.health || 0;
                
                // Mostrar daño si ha perdido salud
                if (prevHealth > this.fighters[1].health) {
                    const damage = prevHealth - this.fighters[1].health;
                    this.battleUI.showDamage(1, damage);
                }
                
                // Actualizar UI
                const hpPercent = (this.fighters[1].health / this.fighters[1].maxHealth) * 100;
                this.battleUI.updateHealth(1, hpPercent);
            }
        }
        
        // Verificar si la batalla ha terminado
        if (state.status === 'finished') {
            this.endBattle(state);
        }
    }

    // Método para enviar un ataque a la API
    async sendAttackToApi(attackerIndex, attackType) {
        if (!this.fighters[attackerIndex] || !this.isGameActive) return;
        
        const attacker = this.fighters[attackerIndex];
        const target = this.fighters[1 - attackerIndex]; // El oponente
        
        if (!attacker.apiCharacterId || !target.apiCharacterId) {
            console.error('Faltan IDs de personajes para el ataque');
            return;
        }
        
        try {
            const attackData = {
                attackerType: attacker.characterType,
                attackerId: attacker.apiCharacterId,
                targetId: target.apiCharacterId,
                attackType: attackType
            };
            
            console.log('Enviando ataque a API:', attackData);
            const response = await sendAttack(this.battleId, attackData, this.token);
            console.log('Respuesta de ataque:', response);
            
            // Actualizar inmediatamente después del ataque
            const battleState = await getBattleState(this.battleId, this.token);
            this.updateGameFromApiState(battleState);
            
            return response;
        } catch (error) {
            console.error('Error enviando ataque a la API:', error);
            return null;
        }
    }

    async endBattle(state) {
        this.isGameActive = false;
        
        // Mostrar animaciones finales
        if (state.winner === 'heroes') {
            this.fighters[0].setState('winner');
            this.fighters[1].setState('dead');
        } else if (state.winner === 'villains') {
            this.fighters[0].setState('dead');
            this.fighters[1].setState('winner');
        }
        
        // Actualizar UI
        this.roundOver = true;
        
        // Mostrar mensaje de victoria/derrota
        const resultMessage = document.createElement('div');
        resultMessage.className = 'battle-result';
        resultMessage.innerHTML = `
            <h2>${state.winner === 'heroes' ? '¡Victoria!' : '¡Derrota!'}</h2>
            <p>${state.message || ''}</p>
            <button id="returnToDashboard">Volver al Dashboard</button>
        `;
        document.body.appendChild(resultMessage);
        
        document.getElementById('returnToDashboard').addEventListener('click', () => {
            window.location.href = '/';
        });
    }

    // Sobrescribir loop para incluir sincronización con API
    loop() {
        if (!this.isGameActive) return;
        
        const now = performance.now();
        const delta = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        // Actualizar lógica de los luchadores
        this.fighters.forEach((fighter, i) => {
            const opponent = this.fighters[1 - i];
            fighter.update(delta, opponent);
        });
        
        // Actualizar UI de salud y especiales
        this.fighters.forEach((fighter, i) => {
            const hpPercent = (fighter.health / fighter.maxHealth) * 100;
            this.battleUI.updateHealth(i, hpPercent);
            const spPercent = (fighter.special / fighter.maxSpecial) * 100;
            this.battleUI.updateSpecial(i, spPercent);
        });
        
        // Renderizar
        this.threeRenderer.render();
        this.spriteRenderer.render(this.fighters);
        
        // Comprobar fin de round basado en datos de la API
        if (!this.roundOver) {
            const heroIsDead = this.fighters[0] && this.fighters[0].health <= 0;
            const villainIsDead = this.fighters[1] && this.fighters[1].health <= 0;
            
            if (heroIsDead || villainIsDead) {
                this.roundOver = true;
                const winner = heroIsDead ? 1 : 0;
                this.roundWins[winner]++;
                this.battleUI.updateRoundWins(this.roundWins[0], this.roundWins[1]);
                
                // Animaciones de final
                this.fighters[winner].setState('winner');
                this.fighters[1 - winner].setState('dead');
                
                // Deshabilitar controles
                if (this.controls && this.controls.disable) {
                    this.controls.disable();
                }
                
                // Finalizar batalla en la API si alcanza 2 victorias
                if (this.roundWins[winner] >= 2) {
                    finishTeamBattle(this.battleId, this.token)
                        .then(response => {
                            console.log('Batalla finalizada:', response);
                            this.endBattle(response);
                        })
                        .catch(error => console.error('Error finalizando batalla:', error));
                } else {
                    // Reiniciar round tras breve pausa
                    setTimeout(() => this.resetRound(), 2000);
                }
            }
        }
        
        // Evitar superposición de fighters: mantener separación mínima
        const sep = 60; // separación mínima en píxeles
        if (this.fighters.length === 2) {
            const f1 = this.fighters[0];
            const f2 = this.fighters[1];
            const dx = f2.x - f1.x;
            if (Math.abs(dx) < sep) {
                const mid = (f1.x + f2.x) / 2;
                f1.x = mid - sep / 2;
                f2.x = mid + sep / 2;
            }
        }
        
        // Continuar el loop
        requestAnimationFrame(() => this.loop());
    }

    async resetRound() {
        console.log('Reiniciando round...');
        this.roundOver = false;
        this.battleUI.startTimer(99);
        
        this.fighters.forEach((f, i) => {
            f.health = f.maxHealth;
            f.special = 0;
            f.comboCount = 0;
            f.setState('idle');
            this.battleUI.updateHealth(i, 100);
            this.battleUI.updateSpecial(i, 0);
            this.battleUI.updateCombo(0);
        });
        
        // Habilitar controles
        if (this.controls && this.controls.enable) {
            this.controls.enable();
        }
        
        // Reiniciar batalla en la API
        try {
            const response = await startTeamBattle(this.battleId, this.token);
            console.log('Batalla reiniciada:', response);
        } catch (error) {
            console.error('Error reiniciando batalla:', error);
        }
    }
}
