// Este archivo puede importar y gestionar la lógica principal de la batalla
import MainInterface from '../MainInterface.js';
import AuthInterface from '../AuthInterface.js';

window.addEventListener('DOMContentLoaded', () => {
  let uiRoot = document.getElementById('mainInterface');
  if (!uiRoot) {
    uiRoot = document.createElement('div');
    uiRoot.id = 'mainInterface';
    uiRoot.style.position = 'absolute';
    uiRoot.style.top = '70px';
    uiRoot.style.left = '50%';
    uiRoot.style.transform = 'translateX(-50%)';
    uiRoot.style.zIndex = '10';
    uiRoot.style.background = 'rgba(30,30,30,0.95)';
    uiRoot.style.borderRadius = '10px';
    uiRoot.style.padding = '24px';
    uiRoot.style.minWidth = '350px';
    document.getElementById('gameContainer').appendChild(uiRoot);
  }

  function showMainInterface() {
    uiRoot.innerHTML = '';
    new MainInterface('mainInterface');
    // Agregar botón de logout
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Cerrar sesión';
    logoutBtn.style.position = 'absolute';
    logoutBtn.style.top = '10px';
    logoutBtn.style.right = '10px';
    logoutBtn.onclick = () => {
      localStorage.removeItem('token');
      showAuthInterface();
    };
    uiRoot.appendChild(logoutBtn);
  }

  function showAuthInterface() {
    uiRoot.innerHTML = '';
    new AuthInterface('mainInterface', showMainInterface);
  }

  if (localStorage.getItem('token')) {
    showMainInterface();
  } else {
    showAuthInterface();
  }
});
