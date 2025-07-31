
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
  loadLoginView();
});
