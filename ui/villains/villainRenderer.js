export function renderVillainForm({ villain, isAdmin, isOwner, onSubmit, onCancel }) {
  const villainFormContainer = document.getElementById('villainFormContainer');
  villainFormContainer.classList.remove('hidden');
  villainFormContainer.innerHTML = `
    <div class='villain-detail-card'>
      <div class='villain-detail-header'>
        <div class='villain-avatar'>
          <span class='villain-icon'>${villain?._id ? '✏️' : '🦹‍♂️'}</span>
        </div>
        <div>
          <h2>${villain?._id ? 'Editar Villano' : 'Crear Villano'}</h2>
          <h3 class='villain-alias'>${villain?.alias || ''}</h3>
        </div>
      </div>
      <form id='villainForm'>
        <div class='villain-detail-body'>
          <div class='villain-attr'><span>🌆 Ciudad:</span> <input name='city' required value='${villain?.city || ''}'></div>
          <div class='villain-attr'><span>🛡️ Equipo:</span> <input name='team' value='${villain?.team || ''}'></div>
          <div class='villain-attr'><span>❤️ Salud:</span> <input name='health' type='number' min='0' max='100' value='${villain?.health ?? 100}'></div>
          <div class='villain-attr'><span>⚡ Stamina:</span> <input name='stamina' type='number' min='0' max='100' value='${villain?.stamina ?? 100}'></div>
          <div class='villain-attr'><span>🏃‍♂️ Velocidad:</span> <input name='speed' type='number' min='0' max='200' value='${villain?.speed ?? 60}'></div>
          <div class='villain-attr'><span>🎯 Crítico:</span> <input name='critChance' type='number' min='0' max='100' value='${villain?.critChance ?? 20}'></div>
          <div class='villain-attr'><span>🔄 Estado:</span> <input name='status' value='${villain?.status || 'normal'}'></div>
          <div class='villain-attr'><span>✨ Especial:</span> <input name='specialAbility' value='${villain?.specialAbility || ''}'></div>
          <div class='villain-attr'><span>🟢 Vivo:</span> <select name='isAlive'><option value='true' ${villain?.isAlive !== false ? 'selected' : ''}>Sí</option><option value='false' ${villain?.isAlive === false ? 'selected' : ''}>No</option></select></div>
          <div class='villain-attr'><span>🏆 Rounds Ganados:</span> <input name='roundsWon' type='number' min='0' value='${villain?.roundsWon ?? 0}'></div>
          <div class='villain-attr'><span>💥 Daño:</span> <input name='damage' type='number' min='0' value='${villain?.damage ?? 0}'></div>
          <div class='villain-attr'><span>🤝 Afinidad Equipo:</span> <input name='teamAffinity' type='number' min='0' value='${villain?.teamAffinity ?? 0}'></div>
          <div class='villain-attr'><span>🔋 Costo Energía:</span> <input name='energyCost' type='number' min='0' value='${villain?.energyCost ?? 20}'></div>
          <div class='villain-attr'><span>🛡️ Reducción Daño:</span> <input name='damageReduction' type='number' min='0' value='${villain?.damageReduction ?? 0}'></div>
          <div class='villain-attr'><span>⚔️ Ataque:</span> <input name='attack' type='number' min='0' value='${villain?.attack ?? 75}'></div>
          <div class='villain-attr'><span>🛡️ Defensa:</span> <input name='defense' type='number' min='0' value='${villain?.defense ?? 45}'></div>
        </div>
        <div class='villain-detail-footer'>
          <button type='submit' class='save'>${villain?._id ? 'Guardar Cambios' : 'Crear Villano'}</button>
          <button type='button' class='cancel'>Cancelar</button>
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
}
// villainRenderer.js
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
    card.innerHTML = `
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
