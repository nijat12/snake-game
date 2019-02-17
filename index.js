import * as global from './global.js';
import { state } from './state.js';

export function resizeCanvas() {
  global.canvas.width = window.innerWidth;
  global.canvas.height = window.innerHeight;
  calculateGridCellSize();

  drawTheCanvas();
};

export function keyboardHandler(event) {
  switch (event.key) {
    case 'ArrowUp':
      {
        // Can't go back
        if (state.currentDirection !== global.movementEnum.DOWN) {
          state.directionQueue.push(global.movementEnum.UP);
        }
        break;
      }
    case 'ArrowDown':
      {
        if (state.currentDirection !== global.movementEnum.UP) {
          state.directionQueue.push(global.movementEnum.DOWN);
        }
        break;
      }
    case 'ArrowLeft':
      {
        if (state.currentDirection !== global.movementEnum.RIGHT) {
          state.directionQueue.push(global.movementEnum.LEFT);
        }
        break;
      }
    case 'ArrowRight':
      {
        if (state.currentDirection !== global.movementEnum.LEFT) {
          state.directionQueue.push(global.movementEnum.RIGHT);
        }
        break;
      }
    case 'Escape':
      {
        // To Pause the Game: 'Cheat Code' Every game neads a cheat code :)
        state.gamePaused = !state.gamePaused;
        // To restart the itteration if it was paused
        itteration();
      }
    default:
      break;
  }
};

function initialGridCalculation() {
  // X axis
  if (window.innerWidth > 1366) {
    state.gridX = 40;
    state.dificulty = 60;
  }

  if (window.innerWidth < 1366) {
    state.gridX = 30;
    state.dificulty = 70;
  }

  if (window.innerWidth < 1280) {
    state.gridX = 20;
    state.dificulty = 90;
  }

  if (window.innerWidth < 768) {
    state.gridX = 12;
    state.dificulty = 100;
  }

  // Y axis
  if (window.innerHeight > 900) {
    state.gridY = 30;
  }

  if (window.innerHeight < 768) {
    state.gridY = 20;
  }

  if (window.innerHeight < 500) {
    state.gridY = 12;
  }
};

function calculateGridCellSize() {
  state.verticalCellSize = window.innerHeight / (state.gridY + 2);
  state.horizontalCellSize = window.innerWidth / (state.gridX + 2);
};

function drawTheCanvas() {
  // Clear out
  global.context.fillStyle = state.backgroundBorderColor;
  global.context.fillRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );

  // Draw new background acount for border
  global.context.fillStyle = state.backgroundColor;
  global.context.fillRect(
    state.horizontalCellSize,
    state.verticalCellSize,
    global.canvas.width - 2 * state.horizontalCellSize,
    global.canvas.height - 2 * state.verticalCellSize
  );

  // Snake with green head
  state.snake.forEach((part, ittr) => {
    drawCube(
      part.x,
      part.y,
      ittr === 0 ? state.snakeHeadColor : state.snakeBodyColor,
      ittr === 0 ? state.snakeHeadBorderColor : state.snakeBodyBorderColor
    );
  });

  // Apple
  drawCube(
    state.apple.x,
    state.apple.y,
    state.appleBodyColor,
    state.appleBorderColor
  );
};

function drawCube(x, y, bodyColor, borderColor) {
  // Body with 2px border
  global.context.fillStyle = bodyColor;
  global.context.fillRect(
    (x + 1) * state.horizontalCellSize + 2,
    (y + 1) * state.verticalCellSize + 2,
    state.horizontalCellSize - 4,
    state.verticalCellSize - 4
  );
  global.context.strokeStyle = borderColor;
  global.context.strokeRect(
    (x + 1) * state.horizontalCellSize,
    (y + 1) * state.verticalCellSize,
    state.horizontalCellSize,
    state.verticalCellSize
  );
};

function moveElements() {
  const head = {
    x: null,
    y: null
  };
  switch (state.currentDirection) {
    case global.movementEnum.UP:
      {
        // Hit the Wall
        if (state.snake[0].y === 0) {
          gameOver();
        }
        head.x = state.snake[0].x;
        head.y = state.snake[0].y - 1;

        break;
      }
    case global.movementEnum.DOWN:
      {
        if (state.snake[0].y === state.gridY - 1) {
          gameOver();
        }
        head.x = state.snake[0].x;
        head.y = state.snake[0].y + 1;

        break;
      }
    case global.movementEnum.LEFT:
      {
        if (state.snake[0].x === 0) {
          gameOver();
        }
        head.x = state.snake[0].x - 1;
        head.y = state.snake[0].y;

        break;
      }
    case global.movementEnum.RIGHT:
      {
        if (state.snake[0].x === state.gridX - 1) {
          gameOver();
        }
        head.x = state.snake[0].x + 1;
        head.y = state.snake[0].y;

        break;
      }
    default:
      throw new Error('Enum not found: index.js - moveElements()');
  }

  // Snake hit itself
  state.snake.forEach(part => {
    if (part.x === head.x && part.y === head.y) {
      gameOver();
    }
  });

  // Don't draw if the game has ended
  if (!state.gameEnded) {
    if (head.x === state.apple.x && head.y === state.apple.y) {
      // Ate the apple
      getNewApple();
    } else {
      // Didn't grow a tail
      state.snake.pop();
    }

    // Advanced forward
    state.snake.unshift(head);
  }

  drawTheCanvas();
};

// Game Clock
function itteration() {
  setTimeout(() => {
    // Apple the next direction in the queue
    if (state.directionQueue.length) {
      state.currentDirection = state.directionQueue.pop();
    }
    moveElements();
    // Continue unless game is paused or ended
    if (!state.gameEnded && !state.gamePaused) {
      itteration();
    }
  }, state.dificulty);
};

function getNewApple() {
  state.apple.x = getRandomLocation(1, state.gridX - 2);
  state.apple.y = getRandomLocation(1, state.gridY - 2);

  // If lands on the snake then re-draw
  state.snake.forEach(part => {
    if (part.x === state.apple.x && part.y === state.apple.y) {
      getNewApple();
    }
  });
};

function getRandomLocation(max, min) {
  return Math.floor((Math.random() * (max - min) + min));
};

function gameOver() {
  state.gameEnded = true;
  alert('Game Over! Please refresh the page to restart');
};

function browserCheck() {
  const isChromium = window.chrome;
  const winNav = window.navigator;
  const vendorName = winNav.vendor;
  const isOpera = typeof window.opr !== "undefined";
  const isIEedge = winNav.userAgent.indexOf("Edge") > -1;

  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    global.canvas.width = window.innerWidth;
    global.canvas.height = window.innerHeight;
    global.context.font = "70px Georgia";
    global.context.fillText("Mobile not supported yet", 20, 500);

    return false;
  }

  if (
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    vendorName === "Google Inc." &&
    isOpera === false &&
    isIEedge === false
  ) {
    return true;
  } else {
    global.canvas.width = window.innerWidth;
    global.canvas.height = window.innerHeight;
    global.context.font = "70px Georgia";
    global.context.fillText("Only Chrome is supported at this time", 20, 500);

    return false;
  }
};

function init() {
  if (browserCheck()) {
    initialGridCalculation();
    resizeCanvas();
    itteration();
  }
};

// 
// Init
// 
init();