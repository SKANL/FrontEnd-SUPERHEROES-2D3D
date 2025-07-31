import { logout } from '../auth/utils.js';
document.getElementById('logoutBtn')?.addEventListener('click', logout);
// Gestor de héroes: listar, crear, editar, eliminar

import * as heroApi from './heroApi.js';
import * as heroRenderer from './heroRenderer.js';
import { getUserIdFromToken, getUserRoleFromTokenAsync } from '../auth/utils.js';

const showCreateFormBtn = document.getElementById('showCreateForm');
const btnSearchCity = document.getElementById('btnSearchCity');
const btnSearchId = document.getElementById('btnSearchId');
const searchCity = document.getElementById('searchCity');
const searchId = document.getElementById('searchId');

async function loadHeroes() {
  try {
    const [heroes, userRole] = await Promise.all([
      heroApi.getHeroes(),
      getUserRoleFromTokenAsync()
    ]);
    heroRenderer.renderHeroesList(heroes, {
      onDetail: showHeroDetail,
      onEdit: showHeroForm,
      onDelete: handleDeleteHero,
      isAdmin: userRole === 'admin',
      userId: getUserIdFromToken()
    });
  } catch (err) {
    document.getElementById('heroesList').innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

async function showHeroDetail(id) {
  try {
    const hero = await heroApi.getHeroById(id);
    heroRenderer.renderHeroDetail(hero, () => {
      document.getElementById('heroDetailContainer').classList.add('hidden');
    });
  } catch (err) {
    document.getElementById('heroDetailContainer').innerHTML = `<div class='hero-detail-box'><p>Error: ${err.message}</p><button class='cancel'>Cerrar</button></div>`;
    document.getElementById('heroDetailContainer').classList.remove('hidden');
    document.querySelector('#heroDetailContainer .cancel').onclick = () => {
      document.getElementById('heroDetailContainer').classList.add('hidden');
    };
  }
}

async function showHeroForm(hero = null) {
  const userRole = await getUserRoleFromTokenAsync();
  const isAdminRole = userRole === 'admin';
  const userId = getUserIdFromToken();
  const isOwner = hero && hero.ownerId === userId;
  heroRenderer.renderHeroForm({
    hero,
    isAdmin: isAdminRole,
    isOwner,
    onSubmit: async (data) => {
      try {
        if (hero) {
          await heroApi.updateHero(hero._id, data);
        } else {
          await heroApi.createHero(data);
        }
        document.getElementById('heroFormContainer').classList.add('hidden');
        loadHeroes();
      } catch (err) {
        alert(err.message);
      }
    },
    onCancel: () => {
      document.getElementById('heroFormContainer').classList.add('hidden');
    }
  });
}

async function handleDeleteHero(id) {
  if (!confirm('¿Eliminar este héroe?')) return;
  try {
    await heroApi.deleteHero(id);
    loadHeroes();
  } catch (err) {
    alert(err.message);
  }
}

btnSearchCity.onclick = async () => {
  const city = searchCity.value.trim();
  if (!city) return;
  try {
    const [heroes, userRole] = await Promise.all([
      heroApi.getHeroesByCity(city),
      getUserRoleFromTokenAsync()
    ]);
    heroRenderer.renderHeroesList(heroes, {
      onDetail: showHeroDetail,
      onEdit: showHeroForm,
      onDelete: handleDeleteHero,
      isAdmin: userRole === 'admin',
      userId: getUserIdFromToken()
    });
  } catch (err) {
    document.getElementById('heroesList').innerHTML = `<p>Error: ${err.message}</p>`;
  }
};

btnSearchId.onclick = () => {
  const id = searchId.value.trim();
  if (!id) return;
  showHeroDetail(id);
};

getUserRoleFromTokenAsync().then(role => {
  if (role === 'admin') {
    showCreateFormBtn.style.display = '';
    showCreateFormBtn.onclick = () => showHeroForm();
  } else {
    showCreateFormBtn.style.display = 'none';
  }
});

loadHeroes();
