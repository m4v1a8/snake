// TODO:
// get the coordinates of the snake and the fruit on the GRID_SIZE 20x20
// if they are both on the same coordinates, it means the fruit was eaten
// move the fruit

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

let rafid;
const CELL_SIZE = 25;
const GRID_SIZE = canvas.width / CELL_SIZE;

let interval = 0.3;
let buttonPressed = false;

const snake = {
  x: Math.floor(GRID_SIZE / 2),
  y: Math.floor(GRID_SIZE / 2),
  dx: 1,
  dy: 0,
  color: "#fe5424",
  moved: false,
  tail: null,
};

const fruit = {
  x: Math.floor(GRID_SIZE / 2),
  y: Math.floor(GRID_SIZE / 2),
  color: "#76D2DB",
  placed: false,
};

function moveSnake(x, y) {
  snake.moved = false;
  snake.x += x * CELL_SIZE;
  snake.y += y * CELL_SIZE;
  snake.moved = true;
}

function moveFruit() {
  fruit.x = Math.floor(Math.random() * GRID_SIZE);
  fruit.y = Math.floor(Math.random() * GRID_SIZE);
}

function draw(color, x, y, w = CELL_SIZE, h = CELL_SIZE) {
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, w, h);
}

function clear() {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#333333";
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < canvas.width / CELL_SIZE; i++) {
    for (let j = 0; j < canvas.width / CELL_SIZE; j++) {
      ctx.strokeRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

window.addEventListener("keydown", (e) => {
  if (buttonPressed) return;
  const key = e.key;
  switch (key) {
    case "ArrowLeft":
      if (snake.dx !== 1) {
        snake.dx = -1;
        snake.dy = 0;
        buttonPressed = true;
      }
      break;
    case "ArrowRight":
      if (snake.dx !== -1) {
        snake.dx = 1;
        snake.dy = 0;
        buttonPressed = true;
      }
      break;
    case "ArrowUp":
      if (snake.dy !== 1) {
        snake.dx = 0;
        snake.dy = -1;
        buttonPressed = true;
      }
      break;
    case "ArrowDown":
      if (snake.dy !== -1) {
        snake.dx = 0;
        snake.dy = 1;
        buttonPressed = true;
      }
      break;
  }
});

clear();
let lastTime = 0;
let timer = 0;
function loop(timestamp) {
  clear();
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  if (dt) {
    timer += dt;
  }

  // will only run on initial render
  if (!fruit.placed) {
    moveFruit();
    fruit.placed = true;
  }

  if (timer >= interval) {
    timer -= interval;
    moveSnake(snake.dx / CELL_SIZE, snake.dy / CELL_SIZE);
    buttonPressed = false;
    // if the fruit is eaten;
    if (snake.x === fruit.x && snake.y === fruit.y) {
      moveFruit();

      if (interval > 0.1) interval -= 0.025;
    }
  }

  draw(fruit.color, fruit.x, fruit.y, CELL_SIZE, CELL_SIZE);
  draw(snake.color, snake.x, snake.y);

  rafid = requestAnimationFrame(loop);
}

loop();
