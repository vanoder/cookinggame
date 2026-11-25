// Sizzle Rush — bootstrap: canvas, game loop, phase transitions.
import { W, H } from './config.js';
import { createGame, stockPlates } from './state.js';
import { initInput, ACT, endFrame } from './input.js';
import { updateGame } from './update.js';
import { renderGame } from './render.js';
import { stageShot } from './shots.js';
import { sfx } from './audio.js';

const canvas = document.getElementById('game');
canvas.width = W;
canvas.height = H;

initInput(canvas);

let game = createGame();
stockPlates(game);

// ?shot=N boots straight into a staged, playing scene for screenshot capture.
const shotParam = new URLSearchParams(location.search).get('shot');
if (shotParam) {
  game.phase = 'playing';
  stageShot(game, Number(shotParam));
}

function newGame() {
  game = createGame();
  stockPlates(game);
  game.phase = 'playing';
  sfx.start();
}

// Scale the canvas to fit the window while keeping the kitchen's aspect.
function fit() {
  const scale = Math.min(innerWidth / W, innerHeight / H);
  canvas.style.width = Math.floor(W * scale) + 'px';
  canvas.style.height = Math.floor(H * scale) + 'px';
}
addEventListener('resize', fit);
fit();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (ACT.action()) {
    if (game.phase === 'title') newGame();
    else if (game.phase === 'gameover') newGame();
  }

  if (!shotParam) updateGame(game, dt);
  renderGame(canvas, game);
  endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
