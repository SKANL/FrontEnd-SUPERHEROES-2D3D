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

const btnVillains = document.getElementById('btnVillains');
if (btnVillains) {
  btnVillains.onclick = (e) => {
    e.preventDefault();
    if (window.loadVillainsView) {
      window.loadVillainsView();
    } else {
      window.location.href = './ui/villains/index.html';
    }
  };
}

const btnTeamBattles = document.getElementById('btnTeamBattles');
if (btnTeamBattles) {
  btnTeamBattles.onclick = (e) => {
    e.preventDefault();
    window.location.href = './ui/teamBattles/index.html';
  };
}
