// Sizzle Rush — game state: player, kitchen grid, board, score, lives, phase.
import { COLS, ROWS, TILE } from './config.js';
import { buildKitchen } from './kitchen.js';
import { FRIDGE_LABELS } from './layout.js';
import { createOrderBoard } from './orders.js';
import { makePlate } from './items.js';

export function createGame() {
  const grid = buildKitchen();
  grid.forEach((row, gy) => row.forEach((st, gx) => {
    const label = FRIDGE_LABELS[gy * row.length + gx];
    if (st.kind === 'fridge' && label) st.held = label;
  }));
  // Spawn the chef on the free floor near the middle.
  const player = {
    x: Math.floor(COLS / 2) * TILE + TILE / 2,
    y: (ROWS - 3) * TILE + TILE / 2,
    w: TILE * 0.62,
    h: TILE * 0.62,
    held: null,           // the item in the chef's hands
    facing: { x: 0, y: -1 },
    step: 0,              // walk animation phase
  };
  return {
    phase: 'title',        // title | playing | gameover
    player,
    grid,
    board: createOrderBoard(),
    score: 0,
    lives: 3,
    time: 0,
    flash: null,           // { text, t } message bubble
    shake: 0,              // screen shake on misses
    combo: 0,              // consecutive successful serves
  };
}

// The station tile in front of the player, based on facing.
export function facingStation(game) {
  const { player } = game;
  const cx = Math.floor(player.x / TILE);
  const cy = Math.floor(player.y / TILE);
  const fx = cx + player.facing.x;
  const fy = cy + player.facing.y;
  if (fx < 0 || fy < 0 || fx >= COLS || fy >= ROWS) return null;
  return game.grid[fy][fx];
}

// Put a clean plate on every plate station at game start.
export function stockPlates(game) {
  for (const row of game.grid) {
    for (const st of row) {
      if (st.kind === 'plate') { st.stack = [makePlate()]; st.held = null; }
    }
  }
}
