const fruitsCountEl = document.querySelector("#fruits-count");
const speedEl = document.querySelector("#speed-count");

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let rafid;
const CELL_SIZE = 16;
canvas.width = CELL_SIZE * 21;
canvas.height = CELL_SIZE * 21;
const GRID_SIZE = canvas.width / CELL_SIZE;
const initialTail = 2;

const FIX_INTERVAL = 0.2;

let interval = FIX_INTERVAL;
let buttonPressed = false;
let gameOver = false;
let fruitsEaten = 0;
let freeCells = [];
let gamePaused = false;
let nextSpeedUp = 5;
let speed = 1;

const snake = {
  x: Math.floor(GRID_SIZE / 2),
  y: Math.floor(GRID_SIZE / 2),
  px: null,
  py: null,
  dir: "right",
  tails: [],
};

const fruit = {
  x: 0,
  y: 0,
};

// INIT
let loopCount = 0;
updateFreeCells(); // initailly fill the free spaces
speedEl.innerText = speed;
moveFruit();

console.log(interval * 10);

// CONTROLS

// movements
window.addEventListener("keydown", (e) => {
  let dir;

  // pause
  if (!gameOver && e.code === "Space") {
    gamePaused = !gamePaused;
  }

  if (gameOver && e.code === "Space") {
    gameReset();
  }

  if (gamePaused || buttonPressed) return;
  switch (e.code) {
    case "ArrowRight":
    case "KeyD":
      if (snake.dir === "left") return;
      dir = "right";
      break;
    case "ArrowLeft":
    case "KeyA":
      if (snake.dir === "right") return;
      dir = "left";
      break;
    case "ArrowUp":
    case "KeyW":
      if (snake.dir === "down") return;
      dir = "up";
      break;
    case "ArrowDown":
    case "KeyS":
      if (snake.dir === "up") return;
      dir = "down";
      console.log("changed");
      break;
  }

  if (!dir) return;

  buttonPressed = true;
  snake.dir = dir;
});

// MAIN LOOP
let lastTime = 0;
let timer = 0;
function main(timestamp) {
  clearScreen();
  // ---- DELTA TIME
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  if (dt) {
    timer += dt;
  }

  // ---- LOGICS
  if (gamePaused === false && timer >= interval) {
    timer = 0;
    if (outOfBounds(snake.x, snake.y)) {
      gameOver = true;
      console.log("YOU DIED!");
    } else {
      if (!gameOver) {
        autoMove(snake, snake.dir);
        buttonPressed = false;
        for (let i = 0; i < snake.tails.length; i++) {
          const t = snake.tails[i];
          const head = i === 0 ? snake : snake.tails[i - 1];
          t.x = head.px;
          t.y = head.py;
        }

        if (collisionWithTail()) {
          gameOver = true;
          console.log("You bit your own tail, you dummy");
        }

        if (loopCount < initialTail) {
          addTail();
          loopCount++;
        }
      }
    }

    if (fruitEaten()) {
      addTail();
      updateFreeCells();
      moveFruit();
      fruitsCountEl.innerText = ++fruitsEaten;
      if (fruitsEaten >= nextSpeedUp) {
        speedUp();
        speedEl.innerText = ++speed;
        nextSpeedUp = fruitsEaten + nextSpeedUp + Math.floor(nextSpeedUp * 0.5);
      }
    }

    snake.px = snake.x;
    snake.py = snake.y;

    for (let i = 0; i < snake.tails.length; i++) {
      const t = snake.tails[i];
      t.px = t.x;
      t.py = t.y;
    }
  }
  // ---- DRAWING FIELD
  drawBg();
  drawBox("#aa3300", snake.x, snake.y);
  drawBox("#00aa00", fruit.x, fruit.y);
  snake.tails.forEach((tail) => {
    drawBox("#880000", tail.x, tail.y);
  });

  if (gamePaused && !gameOver) {
    drawText("Paused", 6 * CELL_SIZE, 5 * CELL_SIZE, CELL_SIZE * 2);
  }

  if (gameOver && !gamePaused) {
    drawText("Game Over", 6 * CELL_SIZE, 5 * CELL_SIZE, CELL_SIZE * 2);
  }

  rafid = requestAnimationFrame(main);
}

main();

// ---- FUNCS ----
function clearScreen() {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBg() {
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      ctx.strokeStyle = "#000";
      ctx.strokeRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

function drawText(text, x, y, size) {
  ctx.font = `${size}px arial`;
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x, y);
}

function drawBox(color, x, y, sx = CELL_SIZE, sy = CELL_SIZE) {
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, sx, sy);
}

function fruitEaten() {
  return fruit.x === snake.x && fruit.y === snake.y;
}

function moveFruit() {
  fruit.x = randomFreeCell()[0];
  fruit.y = randomFreeCell()[1];
}

function addTail() {
  const tailEnd = snake.tails.length
    ? snake.tails[snake.tails.length - 1]
    : snake;
  const tail = { x: tailEnd.x, y: tailEnd.y, dir: tailEnd.dir };
  snake.tails.push(tail);
}

function speedUp() {
  if (interval <= 0.1) return;
  interval -= 0.01;
}

function autoMove(item, dir) {
  let x;
  let y;
  switch (dir) {
    case "right":
      x = 1;
      y = 0;
      break;
    case "left":
      x = -1;
      y = 0;
      break;
    case "up":
      x = 0;
      y = -1;
      break;
    case "down":
      x = 0;
      y = 1;
      break;
  }

  item.x += x;
  item.y += y;
}

function updateFreeCells() {
  freeCells = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const occupiedCells = [snake, ...snake.tails].map((part) => {
        return `${part.x},${part.y}`;
      });

      if (!occupiedCells.includes(`${x},${y}`)) {
        freeCells.push([x, y]);
      }
    }
  }
}

function gameReset() {
  snake.x = Math.floor(GRID_SIZE / 2);
  snake.y = Math.floor(GRID_SIZE / 2);
  snake.px = null;
  snake.py = null;
  snake.dir = "right";
  snake.tails = [];

  interval = FIX_INTERVAL;
  buttonPressed = false;
  gameOver = false;
  fruitsEaten = 0;
  freeCells = [];
  gamePaused = false;
  fruitsCountEl.innerText = fruitsEaten;
  nextSpeedUp = 5;

  loopCount = 0;
}

function outOfBounds(x, y) {
  return x > GRID_SIZE - 1 || x < 0 || y > GRID_SIZE - 1 || y < 0;
}

function collisionWithTail() {
  for (let i = 0; i < snake.tails.length; i++) {
    const t = snake.tails[i];
    if (snake.x === t.x && snake.y === t.y) {
      return true;
    }
  }
  return false;
}

function randomFreeCell() {
  const vector = freeCells[Math.floor(Math.random() * freeCells.length)];

  return vector;
}
