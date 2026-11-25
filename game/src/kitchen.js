// Sizzle Rush — kitchen layout: a fixed map of stations and fridge stock.
import { STATIONS, INGREDIENTS } from './config.js';

// The kitchen grid. 15 x 10 tiles. Legend:
//  B = chop board, S = stove, P = plate stack, ! = serving window, X = bin,
//  F = fridge wall, . = counter (holdable surface), ' ' = floor
const MAP = [
  'FFFFFFFFFFFFFFF',
  'B.BB.SS.B.BB.P.',
  '               ',
  '               ',
  '               ',
  '               ',
  '               ',
  '               ',
  'F.....!....X..F',
  'FFFFFFFFFFFFFFF',
];

export function buildKitchen() {
  const grid = [];
  for (let y = 0; y < MAP.length; y++) {
    const row = [];
    for (let x = 0; x < MAP[y].length; x++) {
      const ch = MAP[y][x];
      row.push(stationFor(ch, x, y));
    }
    grid.push(row);
  }
  return grid;
}

function stationFor(ch, x, y) {
  switch (ch) {
    case 'B': return { kind: 'board',   x, y, held: null, progress: 0, busy: 0 };
    case 'S': return { kind: 'stove',   x, y, held: null, progress: 0, busy: 0 };
    case 'P': return { kind: 'plate',   x, y, held: null, stack: [] };   // clean plates + assembly
    case '!': return { kind: 'serving', x, y, held: null };
    case 'X': return { kind: 'bin',     x, y, held: null };
    case 'F': return { kind: 'fridge',  x, y, held: null };
    case '.': return { kind: 'counter', x, y, held: null };
    default:  return { kind: 'floor',   x, y, held: null };
  }
}

// Fridge stock: the raw ingredients each fridge tile dispenses (cycled by taps).
export const FRIDGE_STOCK = ['tomato', 'lettuce', 'onion', 'bun', 'patty', 'cheese', 'fish', 'rice', 'seaweed', 'dough', 'sauce', 'mushroom'];

// Where each ingredient name sits on the fridge wall, drawn as a labelled bin.
export function fridgeMenu() {
  return Object.keys(INGREDIENTS).map((id, i) => ({ id, slot: i }));
}

export const STATION_BY_KIND = STATIONS;
