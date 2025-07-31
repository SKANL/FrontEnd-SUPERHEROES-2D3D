import { getUserRoleFromTokenAsync } from './ui/auth/utils.js';
// ...existing code...

function getUserNameFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username || payload.name || payload.email || '';
  } catch {
    return '';
  }
}

async function loadDashboardView() {
  const res = await fetch('./ui/dashboard/index.html');
  const html = await res.text();
  const bodyContent = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  document.getElementById('mainApp').innerHTML = bodyContent ? bodyContent[1] : html;
  // Mensaje de bienvenida personalizado
  const userName = getUserNameFromToken();
  const userRole = await getUserRoleFromTokenAsync();
  const container = document.querySelector('.dashboard-container');
  if (container) {
    const welcome = document.createElement('div');
    welcome.className = 'welcome-message';
    welcome.style.marginBottom = '18px';
    welcome.style.fontSize = '1.3em';
    welcome.textContent = `¡Bienvenido, ${userName}!`;
    container.insertBefore(welcome, container.firstChild);

    // Mostrar el rol en la esquina superior derecha
    let roleDiv = document.getElementById('userRoleDisplay');
    if (!roleDiv) {
      roleDiv = document.createElement('div');
      roleDiv.id = 'userRoleDisplay';
      roleDiv.style.position = 'absolute';
      roleDiv.style.top = '18px';
      roleDiv.style.right = '32px';
      roleDiv.style.background = 'rgba(0,0,0,0.7)';
      roleDiv.style.color = '#fff';
      roleDiv.style.padding = '7px 18px';
      roleDiv.style.borderRadius = '8px';
      roleDiv.style.fontWeight = 'bold';
      roleDiv.style.zIndex = '100';
      container.appendChild(roleDiv);
    }
    roleDiv.textContent = `Rol: ${userRole || 'usuario'}`;
  }
  if (!document.querySelector('link[href="/ui/dashboard/style.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/ui/dashboard/style.css';
    document.head.appendChild(link);
  }
  import('./ui/dashboard/dashboard.js').catch(() => {});
}

// SPA básico: carga la vista de login en mainApp al iniciar


function loadLoginView() {
  fetch('./ui/auth/index.html')
    .then(res => res.text())
    .then(html => {
      const bodyContent = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      document.getElementById('mainApp').innerHTML = bodyContent ? bodyContent[1] : html;
      if (!document.querySelector('link[href="/ui/auth/style.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/ui/auth/style.css';
        document.head.appendChild(link);
      }
      import('./ui/auth/login.js').then(mod => {
        if (typeof mod.initLogin === 'function') {
          mod.initLogin();
        }
      });
      // Enlace para alternar a registro
      setTimeout(() => {
        const regLink = document.getElementById('showRegister');
        if (regLink) {
          regLink.onclick = (e) => {
            e.preventDefault();
            loadRegisterView();
          };
        }
      }, 100);
    });
}

function loadRegisterView() {
  fetch('./ui/register/index.html')
    .then(res => res.text())
    .then(html => {
      const bodyContent = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      document.getElementById('mainApp').innerHTML = bodyContent ? bodyContent[1] : html;
      if (!document.querySelector('link[href="/ui/register/style.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/ui/register/style.css';
        document.head.appendChild(link);
      }
      import('./ui/register/register.js').then(mod => {
        if (typeof mod.initRegister === 'function') {
          mod.initRegister();
        }
      });
      // Enlace para alternar a login
      setTimeout(() => {
        const loginLink = document.getElementById('showLogin');
        if (loginLink) {
          loginLink.onclick = (e) => {
            e.preventDefault();
            loadLoginView();
          };
        }
      }, 100);
    });
}


window.addEventListener('DOMContentLoaded', () => {
  // SPA: carga login por defecto
  window.loadDashboardView = loadDashboardView;
  loadLoginView();
});
