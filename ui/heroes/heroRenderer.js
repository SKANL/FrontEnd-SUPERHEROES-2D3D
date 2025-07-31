import { logout } from '../auth/utils.js';
document.getElementById('logoutBtn')?.addEventListener('click', logout);
// heroRenderer.js
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
    // Ensure hero._id exists, fallback to hero.id, log if missing
    const heroId = hero._id || hero.id;
    if (!heroId) {
      console.warn('Hero missing ID:', hero);
    }
    card.innerHTML = `
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
  heroFormContainer.innerHTML = `
    <div class='hero-detail-card'>
      <div class='hero-detail-header'>
        <div class='hero-avatar'>
          <span class='hero-icon'>${hero?._id ? '✏️' : '🦸‍♂️'}</span>
        </div>
        <div>
          <h2>${hero?._id ? 'Editar Héroe' : 'Crear Héroe'}</h2>
          <h3 class='hero-alias'>${hero?.alias || ''}</h3>
        </div>
      </div>
      <form id='heroForm'>
        <div class='hero-detail-body'>
          <div class='hero-attr'><span>🌆 Ciudad:</span> <input name='city' required value='${hero?.city || ''}'></div>
          <div class='hero-attr'><span>🛡️ Equipo:</span> <input name='team' value='${hero?.team || ''}'></div>
          <div class='hero-attr'><span>❤️ Salud:</span> <input name='health' type='number' min='0' max='100' value='${hero?.health ?? 100}'></div>
          <div class='hero-attr'><span>⚡ Stamina:</span> <input name='stamina' type='number' min='0' max='100' value='${hero?.stamina ?? 100}'></div>
          <div class='hero-attr'><span>🏃‍♂️ Velocidad:</span> <input name='speed' type='number' min='0' max='200' value='${hero?.speed ?? 60}'></div>
          <div class='hero-attr'><span>🎯 Crítico:</span> <input name='critChance' type='number' min='0' max='100' value='${hero?.critChance ?? 20}'></div>
          <div class='hero-attr'><span>🔄 Estado:</span> <input name='status' value='${hero?.status || 'normal'}'></div>
          <div class='hero-attr'><span>✨ Especial:</span> <input name='specialAbility' value='${hero?.specialAbility || ''}'></div>
          <div class='hero-attr'><span>🟢 Vivo:</span> <select name='isAlive'><option value='true' ${hero?.isAlive !== false ? 'selected' : ''}>Sí</option><option value='false' ${hero?.isAlive === false ? 'selected' : ''}>No</option></select></div>
          <div class='hero-attr'><span>🏆 Rounds Ganados:</span> <input name='roundsWon' type='number' min='0' value='${hero?.roundsWon ?? 0}'></div>
          <div class='hero-attr'><span>💥 Daño:</span> <input name='damage' type='number' min='0' value='${hero?.damage ?? 0}'></div>
          <div class='hero-attr'><span>🤝 Afinidad Equipo:</span> <input name='teamAffinity' type='number' min='0' value='${hero?.teamAffinity ?? 0}'></div>
          <div class='hero-attr'><span>🔋 Costo Energía:</span> <input name='energyCost' type='number' min='0' value='${hero?.energyCost ?? 20}'></div>
          <div class='hero-attr'><span>🛡️ Reducción Daño:</span> <input name='damageReduction' type='number' min='0' value='${hero?.damageReduction ?? 0}'></div>
          <div class='hero-attr'><span>⚔️ Ataque:</span> <input name='attack' type='number' min='0' value='${hero?.attack ?? 75}'></div>
          <div class='hero-attr'><span>🛡️ Defensa:</span> <input name='defense' type='number' min='0' value='${hero?.defense ?? 45}'></div>
        </div>
        <div class='hero-detail-footer'>
          <button type='submit' class='save'>${hero?._id ? 'Guardar Cambios' : 'Crear Héroe'}</button>
          <button type='button' class='cancel'>Cancelar</button>
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
}