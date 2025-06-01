const gridSize = 15;
const gridEl = document.getElementById("grid");

function createGrid() {
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    gridEl.appendChild(cell);
  }
}

createGrid();
