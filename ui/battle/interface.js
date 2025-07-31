// Interfaz visual y lógica específica para la batalla
export default class BattleInterface {
  constructor(rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.innerHTML = '<h2>Batalla en curso</h2>';
    // Aquí puedes agregar la lógica y los elementos visuales de la batalla
  }
}
