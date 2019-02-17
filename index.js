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
      shouldUpdateState = false;
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

function mobileAndTabletcheck() {
  (function(a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
      state.isMobile = true;
    }
  })(navigator.userAgent || navigator.vendor || window.opera);
};

function mobileBrowserWarning() {
  global.canvas.width = window.innerWidth;
  global.canvas.height = window.innerHeight;
  global.context.font = "70px Georgia";
  global.context.fillText("Mobile not supported yet", 20, 500);
};

function init() {
  mobileAndTabletcheck();

  if (state.isMobile) {
    mobileBrowserWarning();
  } else {
    initialGridCalculation();
    resizeCanvas();
    itteration();
  }
};

// 
// Init
// 
init();