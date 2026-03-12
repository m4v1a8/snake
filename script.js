const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 26 * 21;
canvas.height = 26 * 21;

let rafid;
const CELL_SIZE = 26;
const GRID_SIZE = canvas.width / CELL_SIZE;

let interval = 0.3;
let buttonPressed = false;

const snake = {
  x: Math.floor(GRID_SIZE / 2),
  y: Math.floor(GRID_SIZE / 2),
  dir: "right",
  tails: [],
};

const fruit = {
  x: randomPos(),
  y: randomPos(),
};

let lastTime = 0;
let timer = 0;

// CONTROLS

// movements
window.addEventListener("keydown", (e) => {
  const dir = e.key.slice(5).toLowerCase();
  snake.dir = dir;
});

// MAIN LOOP
function main(timestamp) {
  clearScreen();
  // ---- DELTA TIME
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  if (dt) {
    timer += dt;
  }
  // ---- LOGICS
  if (timer >= interval) {
    timer = 0;
    if (outOfBounds(snake.x, snake.y)) {
      console.log("YOU DIED!");
    } else {
      autoMove(snake, snake.dir);
    }

    if (fruitEaten()) {
      moveFruit();
      addTail();
    }
  }
  // ---- DRAWING FIELD
  drawBg();
  drawBox("#aa0000", snake.x, snake.y);
  drawBox("#00aa00", fruit.x, fruit.y);
  snake.tails.forEach((tail) => {
    drawBox("#aa0000", tail.x, tail.y);
  });

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
      ctx.strokeStyle = "#333333";
      ctx.strokeRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

function drawBox(color, x, y, sx = CELL_SIZE, sy = CELL_SIZE) {
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, sx, sy);
}

function fruitEaten() {
  return fruit.x === snake.x && fruit.y === snake.y;
}

function moveFruit() {
  fruit.x = randomPos();
  fruit.y = randomPos();
}

function addTail() {
  const tailEnd = snake.tails.length
    ? snake.tails[snake.tails.length - 1]
    : snake;
  const tail = { dir: tailEnd.dir };
  switch (tailEnd.dir) {
    case "right":
      tail.x = tailEnd.x - 1;
      tail.y = tailEnd.y;
      break;
    case "left":
      tail.x = tailEnd.x + 1;
      tail.y = tailEnd.y;
      break;
    case "up":
      tail.x = tailEnd.x;
      tail.y = tailEnd.y + 1;
      break;
    case "down":
      tail.x = tailEnd.x;
      tail.y = tailEnd.y - 1;
      break;
  }
  snake.tails.push(tail);
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

function outOfBounds(x, y) {
  return x > GRID_SIZE - 1 || x < 0 || y > GRID_SIZE - 1 || y < 0;
}

function randomPos() {
  return Math.floor(Math.random() * GRID_SIZE);
}
