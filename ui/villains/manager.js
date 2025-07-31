import { logout } from '../auth/utils.js';
document.getElementById('logoutBtn')?.addEventListener('click', logout);
// Gestor de villanos: listar, crear, editar, eliminar

import * as villainApi from './villainApi.js';
import * as villainRenderer from './villainRenderer.js';
import { getUserIdFromToken, getUserRoleFromTokenAsync } from '../auth/utils.js';

const showCreateFormBtn = document.getElementById('showCreateVillainForm');
const btnSearchCity = document.getElementById('btnSearchVillainCity');
const btnSearchId = document.getElementById('btnSearchVillainId');
const searchCity = document.getElementById('searchVillainCity');
const searchId = document.getElementById('searchVillainId');

async function loadVillains() {
  try {
    const [villains, userRole] = await Promise.all([
      villainApi.getVillains(),
      getUserRoleFromTokenAsync()
    ]);
    villainRenderer.renderVillainsList(villains, {
      onDetail: showVillainDetail,
      onEdit: showVillainForm,
      onDelete: handleDeleteVillain,
      isAdmin: userRole === 'admin',
      userId: getUserIdFromToken()
    });
  } catch (err) {
    document.getElementById('villainsList').innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

async function showVillainDetail(id) {
  try {
    const villain = await villainApi.getVillainById(id);
    villainRenderer.renderVillainDetail(villain, () => {
      document.getElementById('villainDetailContainer').classList.add('hidden');
    });
  } catch (err) {
    document.getElementById('villainDetailContainer').innerHTML = `<div class='villain-detail-box'><p>Error: ${err.message}</p><button class='cancel'>Cerrar</button></div>`;
    document.getElementById('villainDetailContainer').classList.remove('hidden');
    document.querySelector('#villainDetailContainer .cancel').onclick = () => {
      document.getElementById('villainDetailContainer').classList.add('hidden');
    };
  }
}

async function showVillainForm(villain = null) {
  const userRole = await getUserRoleFromTokenAsync();
  const isAdminRole = userRole === 'admin';
  const userId = getUserIdFromToken();
  const isOwner = villain && villain.ownerId === userId;
  villainRenderer.renderVillainForm({
    villain,
    isAdmin: isAdminRole,
    isOwner,
    onSubmit: async (data) => {
      try {
        if (villain) {
          await villainApi.updateVillain(villain._id, data);
        } else {
          await villainApi.createVillain(data);
        }
        document.getElementById('villainFormContainer').classList.add('hidden');
        loadVillains();
      } catch (err) {
        alert(err.message);
      }
    },
    onCancel: () => {
      document.getElementById('villainFormContainer').classList.add('hidden');
    }
  });
}

async function handleDeleteVillain(id) {
  if (!confirm('¿Seguro que deseas eliminar este villano?')) return;
  try {
    await villainApi.deleteVillain(id);
    await loadVillains();
  } catch (err) {
    alert('Error al eliminar villano: ' + err.message);
  }
}

// Eventos de búsqueda y carga inicial
btnSearchCity.onclick = async () => {
  try {
    const villains = await villainApi.getVillainsByCity(searchCity.value);
    villainRenderer.renderVillainsList(villains, {
      onDetail: showVillainDetail,
      onEdit: showVillainForm,
      onDelete: handleDeleteVillain,
      isAdmin: (await getUserRoleFromTokenAsync()) === 'admin',
      userId: getUserIdFromToken()
    });
  } catch (err) {
    document.getElementById('villainsList').innerHTML = `<p>Error: ${err.message}</p>`;
  }
};

btnSearchId.onclick = async () => {
  try {
    const villain = await villainApi.getVillainById(searchId.value);
    villainRenderer.renderVillainDetail(villain, () => {
      document.getElementById('villainDetailContainer').classList.add('hidden');
    });
  } catch (err) {
    document.getElementById('villainDetailContainer').innerHTML = `<div class='villain-detail-box'><p>Error: ${err.message}</p><button class='cancel'>Cerrar</button></div>`;
    document.getElementById('villainDetailContainer').classList.remove('hidden');
    document.querySelector('#villainDetailContainer .cancel').onclick = () => {
      document.getElementById('villainDetailContainer').classList.add('hidden');
    };
  }
};


getUserRoleFromTokenAsync().then(role => {
  if (role === 'admin') {
    showCreateFormBtn.style.display = '';
    showCreateFormBtn.onclick = () => showVillainForm();
  } else {
    showCreateFormBtn.style.display = 'none';
  }
});

window.addEventListener('DOMContentLoaded', loadVillains);
