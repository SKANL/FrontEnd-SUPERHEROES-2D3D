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
    <div class='hero-detail-box'>
      <h2>${hero.name} (${hero.alias})</h2>
      <p><strong>Ciudad:</strong> ${hero.city}</p>
      <p><strong>Equipo:</strong> ${hero.team}</p>
      <p><strong>Salud:</strong> ${hero.health}</p>
      <p><strong>Stamina:</strong> ${hero.stamina}</p>
      <p><strong>Velocidad:</strong> ${hero.speed}</p>
      <p><strong>Crítico:</strong> ${hero.critChance}%</p>
      <p><strong>Estado:</strong> ${hero.status}</p>
      <p><strong>Especial:</strong> ${hero.specialAbility}</p>
      <p><strong>isAlive:</strong> ${hero.isAlive ? 'Sí' : 'No'}</p>
      <p><strong>Rounds Ganados:</strong> ${hero.roundsWon}</p>
      <p><strong>Daño:</strong> ${hero.damage}</p>
      <p><strong>teamAffinity:</strong> ${hero.teamAffinity}</p>
      <p><strong>energyCost:</strong> ${hero.energyCost}</p>
      <p><strong>damageReduction:</strong> ${hero.damageReduction}</p>
      <p><strong>attack:</strong> ${hero.attack}</p>
      <p><strong>defense:</strong> ${hero.defense}</p>
      <button class='cancel'>Cerrar</button>
    </div>
  `;
  document.querySelector('#heroDetailContainer .cancel').onclick = onClose;
}


export function renderHeroForm({ hero, isAdmin, isOwner, onSubmit, onCancel }) {
  const heroFormContainer = document.getElementById('heroFormContainer');
  heroFormContainer.classList.remove('hidden');
  let formFields = `
    <label>Nombre</label>
    <input name="name" required value="${hero?.name || ''}">
    <label>Alias</label>
    <input name="alias" required value="${hero?.alias || ''}">
    <label>Ciudad</label>
    <input name="city" required value="${hero?.city || ''}">
    <label>Equipo</label>
    <input name="team" value="${hero?.team || ''}">
    <label>Habilidad Especial</label>
    <input name="specialAbility" value="${hero?.specialAbility || ''}">
    <label>Salud</label>
    <input name="health" type="number" min="0" max="100" value="${hero?.health ?? 100}">
    <label>Stamina</label>
    <input name="stamina" type="number" min="0" max="100" value="${hero?.stamina ?? 100}">
    <label>Velocidad</label>
    <input name="speed" type="number" min="0" max="100" value="${hero?.speed ?? 60}">
    <label>Crítico (%)</label>
    <input name="critChance" type="number" min="0" max="100" value="${hero?.critChance ?? 20}">
  `;
  if (isAdmin) {
    formFields += `
      <label>isAlive</label>
      <select name="isAlive">
        <option value="true" ${hero?.isAlive !== false ? 'selected' : ''}>Sí</option>
        <option value="false" ${hero?.isAlive === false ? 'selected' : ''}>No</option>
      </select>
      <label>Rounds Ganados</label>
      <input name="roundsWon" type="number" min="0" value="${hero?.roundsWon ?? 0}">
      <label>Daño</label>
      <input name="damage" type="number" min="0" value="${hero?.damage ?? 0}">
      <label>Estado</label>
      <input name="status" value="${hero?.status || 'normal'}">
      <label>teamAffinity</label>
      <input name="teamAffinity" type="number" min="0" value="${hero?.teamAffinity ?? 0}">
      <label>energyCost</label>
      <input name="energyCost" type="number" min="0" value="${hero?.energyCost ?? 20}">
      <label>damageReduction</label>
      <input name="damageReduction" type="number" min="0" value="${hero?.damageReduction ?? 0}">
      <label>attack</label>
      <input name="attack" type="number" min="0" value="${hero?.attack ?? 75}">
      <label>defense</label>
      <input name="defense" type="number" min="0" value="${hero?.defense ?? 45}">
    `;
  } else if (isOwner) {
    formFields += `
      <label>Equipo</label>
      <input name="team" value="${hero?.team || ''}">
      <label>Estado</label>
      <input name="status" value="${hero?.status || 'normal'}">
      <label>Stamina</label>
      <input name="stamina" type="number" min="0" max="100" value="${hero?.stamina ?? 100}">
    `;
  }
  heroFormContainer.innerHTML = `
    <div class="form-box">
      <h2>${hero ? 'Editar' : 'Crear'} Héroe</h2>
      <form id="heroForm">
        ${formFields}
        <button type="submit">${hero ? 'Guardar' : 'Crear'}</button>
        <button type="button" class="cancel">Cancelar</button>
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
    if (isAdmin) {
      data.isAlive = data.isAlive === 'true';
      data.roundsWon = Number(data.roundsWon);
      data.damage = Number(data.damage);
      data.teamAffinity = Number(data.teamAffinity);
      data.energyCost = Number(data.energyCost);
      data.damageReduction = Number(data.damageReduction);
      data.attack = Number(data.attack);
      data.defense = Number(data.defense);
    } else if (isOwner) {
      // Solo campos permitidos para usuario
      data = {
        team: data.team,
        status: data.status,
        stamina: Number(data.stamina)
      };
    }
    onSubmit(data);
  };
  document.querySelector('.cancel').onclick = onCancel;
}
