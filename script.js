const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 26 * 21;
canvas.height = 26 * 21;

let rafid;
const CELL_SIZE = 26;
const GRID_SIZE = canvas.width / CELL_SIZE;

let interval = 0.5;
let buttonPressed = false;
let gameover = false;
let fruitsEaten = 0;
let freeCells = [];

const snake = {
  x: Math.floor(GRID_SIZE / 2),
  y: Math.floor(GRID_SIZE / 2),
  px: null,
  py: null,
  dir: "right",
  tails: [],
};
for (let i = 0; i < 20; i++) {
  addTail();
}

updateFreeCells(); // initailly fill the free spaces

const fruit = {
  x: randomFreeCell()[0],
  y: randomFreeCell()[1],
};

let lastTime = 0;
let timer = 0;

// CONTROLS

// movements
window.addEventListener("keydown", (e) => {
  const dir = e.key.slice(5).toLowerCase();
  if (buttonPressed) return;
  const opposites = {
    up: "down",
    left: "right",
    right: "left",
    down: "up",
  };
  if (!dir) return;
  if (snake.dir === opposites[dir]) return;
  snake.dir = dir;
  buttonPressed = true;
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
      gameover = true;
      console.log("YOU DIED!");
    } else {
      if (!gameover) {
        autoMove(snake, snake.dir);
        buttonPressed = false;
        for (let i = 0; i < snake.tails.length; i++) {
          const t = snake.tails[i];
          const head = i === 0 ? snake : snake.tails[i - 1];
          t.x = head.px;
          t.y = head.py;
        }

        if (collisionWithTail()) {
          gameover = true;
          console.log("You bit your own tail, you dummy");
        }
      }
    }

    if (fruitEaten()) {
      updateFreeCells();
      moveFruit();
      addTail();
      fruitsEaten++;
      console.log("fruits:", fruitsEaten);
      if (fruitsEaten > 0 && fruitsEaten % 1 === 0) {
        console.log("speed:", interval * 100);
        speedUp();
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
  fruit.x = randomFreeCell()[0];
  fruit.y = randomFreeCell()[0];
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
  interval -= 0.025;
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

// TODO: not working
function updateFreeCells() {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (snake.x !== x && snake.y !== y) {
        freeCells.push([x, y]);
      }
      snake.tails.forEach((tail) => {
        if (tail.x !== x && tail.y !== y) {
          freeCells.push([x, y]);
        }
      });
    }
  }
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
