const rows = 10;
const cols = 10;
const mines = 12;

let board = [];
let minePositions = [];
let flags = 0;
let revealedCount = 0;
let timer = 0;
let timerInterval;

const boardEl = document.getElementById("board");
const flagsEl = document.getElementById("flags");
const timerEl = document.getElementById("timer");
const startScreen = document.getElementById("start-screen");
const gameOverEl = document.getElementById('game-over');

/* =======================
   PANTALLA INICIAL
   ======================= */
startScreen.addEventListener("click", () => {
  startScreen.style.opacity = "0";
  setTimeout(() => startScreen.style.display = "none", 300);
  startGame();
});

/* =======================
   INICIO DEL JUEGO
   ======================= */
function startGame() {
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
  generateBoard();
  startTimer();
  gameOverEl.style.display = 'none';
}

function generateBoard() {
  board = [];
  boardEl.innerHTML = "";
  flags = 0;
  revealedCount = 0;
  flagsEl.textContent = flags;

  placeMines();
  createCells();
}

function placeMines() {
  minePositions = [];
  while (minePositions.length < mines) {
    const pos = Math.floor(Math.random() * rows * cols);
    if (!minePositions.includes(pos)) minePositions.push(pos);
  }
}

function createCells() {
  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;

    setupTouchEvents(cell);
    cell.addEventListener("click", () => revealCell(cell));
    boardEl.appendChild(cell);
  }
}

/* GESTOS TÁCTILES */
function setupTouchEvents(cell) {
  let pressTimer;
  cell.addEventListener("touchstart", () => { pressTimer = setTimeout(() => toggleFlag(cell), 500); });
  cell.addEventListener("touchend", () => clearTimeout(pressTimer));
}

function toggleFlag(cell) {
  if (cell.classList.contains("revealed")) return;
  if (cell.classList.contains("flag")) { cell.classList.remove("flag"); flags--; }
  else { cell.classList.add("flag"); flags++; }
  flagsEl.textContent = flags;
}

/* REVELAR CELDAS */
function revealCell(cell) {
  if (cell.classList.contains("revealed") || cell.classList.contains("flag")) return;
  const index = parseInt(cell.dataset.index);

  if (minePositions.includes(index)) {
    cell.classList.add("mine");
    if (navigator.vibrate) navigator.vibrate(200);
    endGame(false);
    return;
  }

  revealChain(index);
}

function revealChain(index) {
  const queue = [index];
  const visited = new Set();

  while (queue.length > 0) {
    const i = queue.shift();
    if (visited.has(i)) continue;
    visited.add(i);

    const cell = boardEl.children[i];
    cell.classList.add("revealed", "wave");

    const minesAround = countMines(i);
    if (minesAround > 0) cell.textContent = minesAround;
    else getNeighbors(i).forEach(n => queue.push(n));
  }
}

function getNeighbors(i) {
  const x = i % cols;
  const y = Math.floor(i / cols);
  const neighbors = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) neighbors.push(ny * cols + nx);
    }
  }
  return neighbors;
}

function countMines(i) { return getNeighbors(i).filter(n => minePositions.includes(n)).length; }

/* TIMER */
function startTimer() {
  timer = 0;
  timerInterval = setInterval(() => { timer++; timerEl.textContent = timer; }, 1000);
}

/* FIN DEL JUEGO */
function endGame(win) {
  clearInterval(timerInterval);
  boardEl.querySelectorAll(".cell").forEach((cell, i) => { if (minePositions.includes(i)) cell.classList.add("mine"); });
  gameOverEl.textContent = win ? "¡Has ganado! 🎉" : "¡Has perdido! 💥";
  gameOverEl.style.display = 'flex';
}
