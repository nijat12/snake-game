import * as controllers from './index.js';

window.addEventListener('resize', controllers.resizeCanvas);
window.addEventListener('keydown', controllers.keyboardHandler);
