// Sizzle Rush — update: movement, station actions, order lifecycle.
import { TILE, PLAYER_SPEED, INGREDIENTS } from './config.js';
import { facingStation, stockPlates } from './state.js';
import { tickOrders, serveOrder } from './orders.js';
import { makeItem, makePlate, matchPlate } from './items.js';
import { keyDown, ACT } from './input.js';
import { sfx } from './audio.js';

export function updateGame(game, dt) {
  if (game.phase !== 'playing') return;
  game.time += dt;
  movePlayer(game, dt);
  tickStations(game, dt);
  tickOrders(game.board, dt, game);
  if (game.flash) { game.flash.t -= dt; if (game.flash.t <= 0) game.flash = null; }
  if (game.shake > 0) game.shake -= dt * 3;
  handleAction(game);
  if (game.lives <= 0) { game.phase = 'gameover'; }
}

function movePlayer(game, dt) {
  const p = game.player;
  let dx = 0, dy = 0;
  if (keyDown('ArrowUp') || keyDown('KeyW')) { dy = -1; }
  if (keyDown('ArrowDown') || keyDown('KeyS')) { dy = 1; }
  if (keyDown('ArrowLeft') || keyDown('KeyA')) { dx = -1; }
  if (keyDown('ArrowRight') || keyDown('KeyD')) { dx = 1; }
  if (dx || dy) {
    if (dx && dy) { dx *= 0.707; dy *= 0.707; }
    if (dx && dy) p.facing = { x: Math.sign(dx), y: Math.sign(dy) };
    else if (dx) p.facing = { x: Math.sign(dx), y: 0 };
    else p.facing = { x: 0, y: Math.sign(dy) };
    p.step += dt * 10;
    tryMove(game, dx * PLAYER_SPEED, 0);
    tryMove(game, 0, dy * PLAYER_SPEED);
  }
}

function tryMove(game, dx, dy) {
  const p = game.player;
  const nx = p.x + dx, ny = p.y + dy;
  const r = p.w / 2;
  const corners = [[nx - r, ny - r], [nx + r, ny - r], [nx - r, ny + r], [nx + r, ny + r]];
  for (const [cx, cy] of corners) {
    const tx = Math.floor(cx / TILE), ty = Math.floor(cy / TILE);
    if (tx < 0 || ty < 0 || tx >= game.grid[0].length || ty >= game.grid.length) return;
    if (game.grid[ty][tx].kind !== 'floor') return;
  }
  p.x = nx; p.y = ny;
}

// Chop boards and stoves advance their progress; finished prep transforms the item.
function tickStations(game, dt) {
  for (const row of game.grid) for (const st of row) {
    if (st.kind === 'board' && st.busy > 0) {
      st.busy -= dt;
      st.progress = 1 - st.busy / st.total;
      if (st.busy <= 0) { st.held = { type: 'prepped', id: prepResult(st) }; st.progress = 0; st.busy = 0; sfx.chop(); }
    }
    if (st.kind === 'stove' && st.busy > 0) {
      st.busy -= dt;
      st.progress = 1 - st.busy / st.total;
      if (st.busy <= 0) { st.held = { type: 'prepped', id: prepResult(st) }; st.progress = 0; st.busy = 0; sfx.sizzle(); }
    }
  }
}

// Space/E interacts with the station the chef faces. Q picks nothing extra; keep one button simple.
function handleAction(game) {
  if (!ACT.action()) return;
  const st = facingStation(game);
  if (!st) return;
  const p = game.player;

  switch (st.kind) {
    case 'fridge': {
      // Fridge dispenses the raw ingredient its bin shows (cycle the fridge menu with repeated taps
      // by moving along the wall — each fridge tile holds one ingredient id).
      if (!p.held) { p.held = makeItem(st.held || 'tomato'); sfx.pick(); }
      break;
    }
    case 'counter': {
      swapHeld(st, p); break;
    }
    case 'board': {
      if (st.busy > 0) break;                                   // still chopping
      if (!st.held && p.held && p.held.type === 'ingredient' && !prepResult({ held: p.held.id, kind: 'board' })) break;
      if (!st.held && p.held && p.held.type === 'ingredient' && prepResult({ held: p.held.id, kind: 'board' })) {
        st.held = p.held; p.held = null; st.total = 1.1; st.busy = 1.1; st.progress = 0; sfx.put();
      } else if (st.held && !p.held) { p.held = st.held; st.held = null; sfx.pick(); }
      break;
    }
    case 'stove': {
      if (st.busy > 0) break;
      if (!st.held && p.held && p.held.type === 'ingredient' && prepResult({ held: p.held.id, kind: 'stove' })) {
        st.held = p.held; p.held = null; st.total = 2.2; st.busy = 2.2; st.progress = 0; sfx.put();
      } else if (st.held && !p.held) { p.held = st.held; st.held = null; sfx.pick(); }
      break;
    }
    case 'plate': {
      st.stack = st.stack || [makePlate()];
      const top = st.stack[st.stack.length - 1];
      // Plate logic: empty hand takes the top plate; holding an ingredient adds it;
      // holding a plate swaps plates.
      if (!p.held && top) { p.held = top; st.stack.pop(); sfx.pick(); }
      else if (p.held && p.held.type === 'ingredient' || p.held && p.held.type === 'prepped') {
        top.items.push(p.held.id); p.held = null; sfx.put();
      } else if (p.held && p.held.type === 'plate' && p.held.items.length) {
        st.stack.push(p.held); p.held = null; sfx.put();
      }
      break;
    }
    case 'serving': {
      if (p.held && p.held.type === 'plate' && p.held.items.length) {
        const o = serveOrder(game.board, p.held);
        if (o) {
          game.score += Math.round(o.reward * patienceBonus(o) * comboMul(game));
          game.combo++;
          game.flash = { text: `Served ${o.name}! +${Math.round(o.reward * patienceBonus(o) * comboMul(game))}`, t: 1.4 };
          if (game.combo >= 3) sfx.combo(); else sfx.serve();
        } else {
          game.flash = { text: 'Nobody ordered that…', t: 1.2 };
          sfx.miss();
        }
        p.held = null;
      }
      break;
    }
    case 'bin': {
      if (p.held) { p.held = null; sfx.trash(); game.flash = { text: 'Binned.', t: 0.8 }; }
      break;
    }
  }
}

function swapHeld(st, p) {
  const tmp = st.held;
  st.held = p.held;
  p.held = tmp;
  sfx[tmp ? 'put' : 'pick']();
}

// What a board or stove turns its current raw ingredient into, from the config prep tables.
function prepResult(st) {
  const id = typeof st.held === 'string' ? st.held : st.held && st.held.id;
  const def = INGREDIENTS[id];
  if (!def) return null;
  const action = st.kind === 'board' ? 'chop' : 'cook';
  return def.prep[action] || null;
}

function patienceBonus(o) {
  return 0.6 + 0.4 * Math.max(0, o.patience / o.maxPatience);
}

function comboMul(game) {
  return 1 + Math.min(0.5, game.combo * 0.1);
}

