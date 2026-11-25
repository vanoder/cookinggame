// Sizzle Rush — input: keyboard state, action edge detection.
const keys = {};
const pressed = {};

export function initInput(canvas) {
  addEventListener('keydown', e => {
    if (!keys[e.code]) pressed[e.code] = true;
    keys[e.code] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Enter','KeyE'].includes(e.code)) e.preventDefault();
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
}

export function keyDown(code) { return !!keys[code]; }
export function keyPressed(code) { return !!pressed[code]; }
export function endFrame() { for (const k in pressed) delete pressed[k]; }

export const ACT = {
  up: () => keyDown('ArrowUp') || keyDown('KeyW'),
  down: () => keyDown('ArrowDown') || keyDown('KeyS'),
  left: () => keyDown('ArrowLeft') || keyDown('KeyA'),
  right: () => keyDown('ArrowRight') || keyDown('KeyD'),
  action: () => keyPressed('Space') || keyPressed('KeyE') || keyPressed('Enter'),
  pick: () => keyPressed('KeyQ'),
};
