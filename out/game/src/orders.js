// Sizzle Rush — the order board: customers, their orders and patience.
import { RECIPES, DIFFICULTY } from './config.js';

// An order: { id, recipe, patience (0..1), maxPatience, name, tint }.
let nextOrderId = 1;

export function makeOrder(servedCount) {
  const r = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  const maxPatience = DIFFICULTY.start_patience * Math.pow(DIFFICULTY.patience_decay, servedCount);
  return {
    id: nextOrderId++,
    recipe: r.id,
    name: r.name,
    reward: r.reward,
    items: [...r.items],
    maxPatience,
    patience: maxPatience,
    tint: `hsl(${(r.id.length * 47 + r.name.length * 13) % 360} 45% 55%)`,
  };
}

// Order board state and tick logic.
export function createOrderBoard() {
  return {
    orders: [],
    servedCount: 0,
    failedCount: 0,
    spawnTimer: 3,          // first order arrives quickly
    spawnEvery: DIFFICULTY.order_every,
  };
}

export function tickOrders(board, dt, state) {
  // Spawn new orders up to the cap.
  board.spawnTimer -= dt;
  if (board.spawnTimer <= 0 && board.orders.length < DIFFICULTY.max_orders) {
    board.orders.push(makeOrder(board.servedCount));
    board.spawnEvery *= DIFFICULTY.order_every_decay;
    board.spawnTimer = board.spawnEvery;
  }
  // Decay patience; expire the front of the line first.
  for (const o of board.orders) o.patience -= dt;
  const expired = board.orders.filter(o => o.patience <= 0);
  if (expired.length) {
    board.orders = board.orders.filter(o => o.patience > 0);
    board.failedCount += expired.length;
    state.lives -= expired.length;
    state.flash = { text: 'Order missed!', t: 1.4 };
  }
}

// Serving a plate: find the oldest order it matches.
export function serveOrder(board, plate) {
  const sorted = [...plate.items].sort();
  for (let i = 0; i < board.orders.length; i++) {
    const o = board.orders[i];
    const want = [...o.items].sort();
    if (want.length === sorted.length && want.every((w, k) => w === sorted[k])) {
      board.orders.splice(i, 1);
      board.servedCount++;
      return o;
    }
  }
  return null;
}
