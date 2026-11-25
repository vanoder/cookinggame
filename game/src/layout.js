// Sizzle Rush — layout: re-exports grid constants and the fridge wall's ingredient slots.
// The fridge wall (top and bottom border rows marked F) each shows one ingredient bin;
// this table assigns ids in reading order so bins are stable and labelled.
import { COLS, ROWS, TILE, W, H, INGREDIENTS, PREPPED } from './config.js';

export { COLS, ROWS, TILE, W, H, INGREDIENTS, PREPPED };

const FRIDGE_IDS = [
  'tomato', 'lettuce', 'onion', 'bun', 'patty', 'cheese',
  'fish', 'rice', 'seaweed', 'dough', 'sauce', 'mushroom',
];

// Map every grid cell to a fridge ingredient id when it is a fridge bin on the top wall
// (the bottom wall repeats the menu). Interior fridge cells stay unlabelled.
export const FRIDGE_LABELS = (() => {
  const table = {};
  const top = 0, bottom = (ROWS - 1) * COLS;
  let n = 0;
  for (let x = 1; x < COLS - 1; x++) {
    table[top + x] = FRIDGE_IDS[n % FRIDGE_IDS.length];
    table[bottom + x] = FRIDGE_IDS[(n + 6) % FRIDGE_IDS.length];
    n++;
  }
  return table;
})();

export { FRIDGE_IDS };
