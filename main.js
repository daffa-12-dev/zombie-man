const gridSize = 15;
const gridEl = document.getElementById("grid");
const totalCells = gridSize * gridSize;

function createGrid() {
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    gridEl.appendChild(cell);
  }
}

createGrid();

// Tambahkan zombie (player)
let zombieIndex = Math.floor(Math.random() * totalCells);
grid.children[zombieIndex].classList.add("zombie");

// Tambahkan beberapa manusia secara acak
let humanCount = 5;
let added = 0;

while (added < humanCount) {
  let randomIndex = Math.floor(Math.random() * totalCells);
  if (
    !grid.children[randomIndex].classList.contains("zombie") &&
    !grid.children[randomIndex].classList.contains("human")
  ) {
    grid.children[randomIndex].classList.add("human");
    added++;
  }
}