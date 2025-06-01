const grid = document.getElementById("grid");
const gridSize = 15;
const totalCells = gridSize * gridSize;

// Buat grid 15x15
for (let i = 0; i < totalCells; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index = i;
  grid.appendChild(cell);
}

// Fungsi bantu konversi index ke x,y
function indexToCoord(index) {
  return { x: index % gridSize, y: Math.floor(index / gridSize) };
}

function coordToIndex(x, y) {
  return y * gridSize + x;
}

// Tambahkan zombie
let zombie = {
  x: 0,
  y: 0
};
let zombieIndex = coordToIndex(zombie.x, zombie.y);
grid.children[zombieIndex].classList.add("zombie");

// Tambahkan manusia
let humanCount = 5;
let humans = [];

while (humans.length < humanCount) {
  let x = Math.floor(Math.random() * gridSize);
  let y = Math.floor(Math.random() * gridSize);
  if (x === zombie.x && y === zombie.y) continue;

  let idx = coordToIndex(x, y);
  if (!grid.children[idx].classList.contains("human")) {
    grid.children[idx].classList.add("human");
    humans.push({ x, y });
  }
}

// Fungsi update posisi zombie di grid
function updateZombiePosition(oldX, oldY, newX, newY) {
  let oldIndex = coordToIndex(oldX, oldY);
  let newIndex = coordToIndex(newX, newY);
  grid.children[oldIndex].classList.remove("zombie");
  grid.children[newIndex].classList.add("zombie");
}

// Event keydown untuk gerakan
document.addEventListener("keydown", (e) => {
  let dx = 0;
  let dy = 0;

  if (e.key === "w" || e.key === "ArrowUp") dy = -1;
  else if (e.key === "s" || e.key === "ArrowDown") dy = 1;
  else if (e.key === "a" || e.key === "ArrowLeft") dx = -1;
  else if (e.key === "d" || e.key === "ArrowRight") dx = 1;
  else return;

  const newX = zombie.x + dx;
  const newY = zombie.y + dy;

  if (
    newX >= 0 && newX < gridSize &&
    newY >= 0 && newY < gridSize
  ) {
    updateZombiePosition(zombie.x, zombie.y, newX, newY);
    zombie.x = newX;
    zombie.y = newY;
  }
});
