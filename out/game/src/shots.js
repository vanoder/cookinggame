// Sizzle Rush — staged scenes for screenshots: with ?shot=1|2|3 the game boots into a
// representative moment (orders up, dish mid-assembly, plate ready to serve) so the
// maker can capture real renders of the game. No game logic is altered otherwise.
import { W, H } from './config.js';
import { INGREDIENTS, PREPPED } from './layout.js';

// Stage a playing game with realistic content for a screenshot.
export function stageShot(game, n) {
  game.phase = 'playing';
  game.time = 40;
  game.score = 120;
  // Two live orders on the board.
  const A = { id: 1, recipe: 'burger', name: 'Classic Burger', reward: 30, items: ['bun', 'cooked_patty', 'chopped_lettuce', 'chopped_onion'], maxPatience: 90, patience: 55, tint: 'hsl(18 45% 55%)' };
  const B = { id: 2, recipe: 'fishrice', name: 'Fish Rice Bowl', reward: 28, items: ['rice_bowl', 'cooked_fish', 'chopped_seaweed'], maxPatience: 85, patience: 31, tint: 'hsl(190 45% 55%)' };
  game.board.orders = n === 3 ? [B] : [A, B];
  game.board.servedCount = 4;
  game.combo = 2;
  // An ingredient mid-chop on the board and a patty sizzling on the stove.
  const st = (x, y) => game.grid[y][x];
  const board = st(1, 1);
  board.held = { type: 'ingredient', id: 'onion' };
  board.busy = 0.4; board.total = 1.1; board.progress = 0.6;
  const stove = st(5, 1);
  stove.held = { type: 'ingredient', id: 'patty' };
  stove.busy = 1.6; stove.total = 2.2; stove.progress = 0.3;
  // A counter holding a chopped tomato.
  st(10, 2).held = { type: 'prepped', id: 'chopped_tomato' };
  st(4, 3).held = { type: 'ingredient', id: 'cheese' };
  if (n >= 2) {
    // A plate mid-assembly on the plate stack.
    const plate = st(8, 2);
    plate.stack = [{ type: 'plate', id: 'plate', items: ['bun', 'cooked_patty'] }];
    // The chef holds chopped lettuce, standing near the plate.
    game.player.held = n === 3
      ? { type: 'plate', id: 'plate', items: ['bun', 'cooked_patty', 'chopped_lettuce', 'chopped_onion'] }
      : { type: 'prepped', id: 'chopped_lettuce' };
    game.player.x = 8.5 * 44 + 22;
    game.player.y = 3.6 * 44 + 22;
    game.player.facing = { x: 0, y: -1 };
  }
  if (n === 3) {
    game.flash = { text: 'Order up! Take it to the Serve window', t: 3 };
  }
}
