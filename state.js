import { movementEnum } from './global.js';

export const state = {
  // Canvas Grid count including borders
  gridX: 40,
  gridY: 20,
  snake: [{
    x: 2,
    y: 2
  }],
  apple: {
    x: 10,
    y: 10
  },
  gamePaused: false,
  gameEnded: false,
  verticalCellSize: 0,
  horizontalCellSize: 0,
  currentDirection: movementEnum.RIGHT,
  directionQueue: [],
  
  // NEXT VERSION
  dificulty: 100, // ms
  appleBodyColor: 'red',
  appleBorderColor: 'white',
  snakeBodyColor: 'yellow',
  snakeBodyBorderColor: 'white',
  snakeHeadColor: 'green',
  snakeHeadBorderColor: 'white',
  backgroundColor: 'black',
  backgroundBorderColor: 'white'
  // END: NEXT VERSION
};