// Panel de control: redirige a la interfaz seleccionada
const btnHeroes = document.getElementById('btnHeroes');
btnHeroes.onclick = (e) => {
  e.preventDefault();
  if (window.loadHeroesView) {
    window.loadHeroesView();
  } else {
    // fallback: SPA no cargó, redirige por URL
    window.location.href = './ui/heroes/index.html';
  }
};
