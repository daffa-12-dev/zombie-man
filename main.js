const gridSize = 15;
const gridEl = document.getElementById("grid");
let zombie = { x: 0, y: 0 }; // Zombie position
let humans = []; // Array of human positions
let obstacles = []; // Array of obstacle positions
let score = 0;
let level = 1;
let intervalId = null;
let timeLeft = 30;
let timerInterval = null;
let humanMoveInterval = null;

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");

function rand(min = 0, max = gridSize - 1) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function index(x, y) {
  return y * gridSize + x;
}

function createGrid() {
  gridEl.innerHTML = "";
  for (let i = 0; i < gridSize * gridSize; i++) {
    const div = document.createElement("div");
    div.classList.add("cell");
    gridEl.appendChild(div);
  }
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

function moveHumans() {
  humans = humans.map(human => {
    const directions = [
      { x: human.x + 1, y: human.y },
      { x: human.x - 1, y: human.y },
      { x: human.x, y: human.y + 1 },
      { x: human.x, y: human.y - 1 }
    ];

    // Tambahkan posisi sekarang sebagai pilihan default
    directions.push({ x: human.x, y: human.y });

    // Pilih posisi yang paling jauh dari zombie dan tidak ada obstacle
    let safest = directions
      .filter(d => isValidCell(d.x, d.y))
      .sort((a, b) => {
        const da = distance(a.x, a.y, zombie.x, zombie.y);
        const db = distance(b.x, b.y, zombie.x, zombie.y);
        return db - da; // urut dari paling jauh
      })[0];

    return safest;
  });

  updateGrid();
}

function checkCollision() {
  let eatenThisTick = false;
  const newHumans = [];

  humans.forEach(h => {
    if (h.x === zombie.x && h.y === zombie.y) {
      const cell = gridEl.children[index(h.x, h.y)];
      cell.classList.add("eating");
      eatenThisTick = true;

      setTimeout(() => {
        cell.classList.remove("human", "eating");
        score++;
        document.getElementById("score").textContent = `Skor: ${score} | Level: ${level}`;
        
        // Hapus manusia dari array baru setelah animasi
        humans = humans.filter(hh => !(hh.x === h.x && hh.y === h.y));

        updateGrid();

        // Cek habisnya manusia baru setelah update
        if (humans.length === 0) {
          clearInterval(intervalId);
          nextBtn.style.display = "inline";
        }
      }, 300);
    } else {
      newHumans.push(h);
    }
  });

  // Jangan langsung update humans, tunggu sampai timeout
  if (!eatenThisTick) {
    humans = newHumans;
  }
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

function gameLoop() {
  moveHumans();
  checkCollision();
  updateGrid();
}

function startGame() {
  score = 0;
  level = 1;
  zombie = { x: 0, y: 0 };
  spawnObstacles(5);
  spawnHumans(3);
  createGrid();
  updateGrid();
  clearInterval(intervalId);
  intervalId = setInterval(gameLoop, 1000);
  nextBtn.style.display = "none";
}

function nextLevel() {
  zombie = { x: 0, y: 0 };
  level++;
  spawnObstacles(Math.min(level + 2, 15));
  spawnHumans(level * 2);
  updateGrid();
  clearInterval(intervalId);
  intervalId = setInterval(gameLoop, 1000);
  nextBtn.style.display = "none";
}

startBtn.onclick = startGame;
nextBtn.onclick = nextLevel;

function startTimer() {
  clearInterval(timerInterval); // reset jika sebelumnya ada
  timeLeft = 30; // bisa disesuaikan per level
  document.getElementById("timer").textContent = `⏳ Timer: ${timeLeft}`;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `⏳ Timer: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      clearInterval(intervalId); // hentikan gerak
      alert("⛔ Waktu habis! Game Over.");
    }
  }, 1000);
}

function startLevel() {
  // Reset zombie & manusia
  zombie = { x: 0, y: 0 };
  humans = [];
  for (let i = 0; i < level; i++) {
    let hx = Math.floor(Math.random() * gridSize);
    let hy = Math.floor(Math.random() * gridSize);
    humans.push({ x: hx, y: hy });
  }

  // Obstacle acak
  obstacles = [];
  for (let i = 0; i < level + 3; i++) {
    let ox = Math.floor(Math.random() * gridSize);
    let oy = Math.floor(Math.random() * gridSize);
    if (!(ox === zombie.x && oy === zombie.y)) {
      obstacles.push({ x: ox, y: oy });
    }
  }

  // Update grid dan mulai timer & gerak
  updateGrid();
  startTimer();

  // Mulai ulang gerakan zombie otomatis
  clearInterval(intervalId);
  //intervalId = humanSpeed = Math.max(400, 1500 - (level - 1) * 100); // Semakin tinggi level, semakin cepat
  const humanSpeed = 900; // tetap 0.5 detik per langkah
  clearInterval(humanMoveInterval);
  humanMoveInterval = setInterval(moveHumans, humanSpeed);
  setInterval(step, zombieSpeed);

  // Sembunyikan tombol next/start
  nextBtn.style.display = "none";
  startBtn.style.display = "none";

  clearInterval(humanMoveInterval);
  humanMoveInterval = setInterval(moveHumans, 500); // manusia gerak tiap 0.5 detik

  humans = [];
  for (let i = 0; i < level; i++) {
  let hx = Math.floor(Math.random() * gridSize);
  let hy = Math.floor(Math.random() * gridSize);
  humans.push({ x: hx, y: hy });
}
}

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

function isValidCell(x, y) {
  return (
    x >= 0 &&
    y >= 0 &&
    x < gridSize &&
    y < gridSize &&
    !obstacles.some(o => o.x === x && o.y === y)
  );
}

function distance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function step() {
  // Logic pergerakan zombie satu langkah
  if (path.length > 0) {
    const next = path.shift();
    zombie.x = next.x;
    zombie.y = next.y;

    // Cek apakah zombie bertabrakan dengan manusia
    humans = humans.filter(human => {
      const isCaught = human.x === zombie.x && human.y === zombie.y;
      if (isCaught) {
        score += 1;
        showEatAnimation(zombie.x, zombie.y); // animasi makan
      }
      return !isCaught; // Hapus manusia yang tertangkap
    });

    updateGrid();

    // Jika semua manusia sudah habis, tampilkan next level
    if (humans.length === 0) {
      clearInterval(zombieMoveInterval);
      clearInterval(humanMoveInterval);
      document.getElementById("nextLevelBtn").style.display = "block";
    }
  }
}

function showEatAnimation(x, y) {
  const cell = document.getElementById(`cell-${x}-${y}`);
  if (cell) {
    cell.classList.add("eating");
    setTimeout(() => {
      cell.classList.remove("eating");
    }, 300);
  }
}
