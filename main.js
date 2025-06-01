const gridSize = 15;
const grid = document.getElementById("grid");
const totalCells = gridSize * gridSize;
let zombie = { x: 0, y: 0 }; // Zombie position
let humans = []; // Array of human positions
let obstacles = []; // Array of obstacle positions
let score = 0;

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");

// Buat grid 15x15
for (let i = 0; i < totalCells; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index = i;
  grid.appendChild(cell);
}

// Update grid display
function updateGrid() {
  // Reset all cells except those with animations
  document.querySelectorAll(".cell").forEach(cell => {
    if (!cell.classList.contains("eating")) {
      cell.className = "cell";
    }
  });

  // Add obstacles, humans, and zombie
  for (const o of obstacles) gridEl.children[index(o.x, o.y)].classList.add("obstacle");
  for (const h of humans) gridEl.children[index(h.x, h.y)].classList.add("human");
  gridEl.children[index(zombie.x, zombie.y)].classList.add("zombie");
}

// Spawn obstacles randomly
function spawnObstacles(count) {
  obstacles = [];
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(); y = rand();
    } while (
      (x === zombie.x && y === zombie.y) ||
      obstacles.some(o => o.x === x && o.y === y)
    );
    obstacles.push({ x, y });
  }
}

// Spawn humans randomly
function spawnHumans(count) {
  humans = [];
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(); y = rand();
    } while (
      (x === zombie.x && y === zombie.y) ||
      humans.some(h => h.x === x && h.y === y) ||
      obstacles.some(o => o.x === x && o.y === y)
    );
    humans.push({ x, y });
  }
}

function bfsDistanceMap(startX, startY) {
  const visited = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
  const distance = Array(gridSize).fill().map(() => Array(gridSize).fill(Infinity));
  const queue = [[startX, startY]];
  visited[startY][startX] = true;
  distance[startY][startX] = 0;

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (
        nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize &&
        !visited[ny][nx] &&
        !obstacles.some(o => o.x === nx && o.y === ny)
      ) {
        visited[ny][nx] = true;
        distance[ny][nx] = distance[y][x] + 1;
        queue.push([nx, ny]);
      }
    }
  }
  return distance;
}

function bfs(sx, sy, tx, ty) {
  let queue = [[sx, sy]];
  let visited = {};
  let parent = {};

  visited[`${sx},${sy}`] = true;

  while (queue.length > 0) {
    let [x, y] = queue.shift();

    if (x === tx && y === ty) break;

    let neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ];

    for (let [nx, ny] of neighbors) {
      const key = `${nx},${ny}`;
      if (
        nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize &&
        !visited[key] &&
        !obstacles.some(o => o.x === nx && o.y === ny)
      ) {
        visited[key] = true;
        parent[key] = [x, y];
        queue.push([nx, ny]);
      }
    }
  }

  // Bangun path menjauh dari zombie
  let path = [];
  let current = `${tx},${ty}`;
  while (current !== `${sx},${sy}`) {
    if (!parent[current]) break;
    const [px, py] = parent[current];
    path.push({ x: parseInt(current.split(',')[0]), y: parseInt(current.split(',')[1]) });
    current = `${px},${py}`;
  }

  return path.reverse();
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
  let dx = 0, dy = 0;
  if (e.key === "w" || e.key === "ArrowUp") dy = -1;
  else if (e.key === "s" || e.key === "ArrowDown") dy = 1;
  else if (e.key === "a" || e.key === "ArrowLeft") dx = -1;
  else if (e.key === "d" || e.key === "ArrowRight") dx = 1;

  const nx = zombie.x + dx, ny = zombie.y + dy;
  if (
    nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize &&
    !obstacles.some(o => o.x === nx && o.y === ny)
  ) {
    zombie.x = nx;
    zombie.y = ny;
    checkCollision();
    updateGrid();
  }
});

startBtn.addEventListener("click", () => {
  level = 1;
  score = 0;
  document.getElementById("score").textContent = `Skor: ${score} | Level: ${level}`;
  startLevel();
});

nextBtn.addEventListener("click", () => {
  level++;
  startLevel();
});

function checkCollision() {
  const targetIndex = humans.findIndex(h => h.x === zombie.x && h.y === zombie.y);

  if (targetIndex !== -1) {
    const h = humans[targetIndex];
    const cell = gridEl.children[index(h.x, h.y)];
    cell.classList.add("eating");

    // Hilangkan hanya animasi dulu, tunda penghapusan dari array dan updateGrid
    setTimeout(() => {
      humans.splice(targetIndex, 1); // hapus dari array
      updateGrid(); // baru update tampilan

      score++;
      document.getElementById("score").textContent = `Skor: ${score} | Level: ${level}`;

      if (humans.length === 0) {
        clearInterval(intervalId);
        nextBtn.style.display = "inline";
      }
    }, 300);
  }
}


document.addEventListener("keydown", (e) => {
  let dx = 0, dy = 0;
  if (e.key === "w" || e.key === "ArrowUp") dy = -1;
  else if (e.key === "s" || e.key === "ArrowDown") dy = 1;
  else if (e.key === "a" || e.key === "ArrowLeft") dx = -1;
  else if (e.key === "d" || e.key === "ArrowRight") dx = 1;

  const nx = zombie.x + dx;
  const ny = zombie.y + dy;

  if (
    nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize &&
    !obstacles.some(o => o.x === nx && o.y === ny)
  ) {
    zombie.x = nx;
    zombie.y = ny;
    checkCollision(); // cek apakah zombie tabrak manusia
    updateGrid();     // update tampilan
  }
});
