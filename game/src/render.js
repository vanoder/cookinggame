// Sizzle Rush — renderer: the kitchen, stations, items, chef, order board and HUD.
import { TILE, COLS, ROWS, W, H, INGREDIENTS, PREPPED, FRIDGE_LABELS } from './layout.js';
import { itemName, itemColor, stackColors } from './items.js';

export function renderGame(canvas, game) {
  const ctx = canvas.getContext('2d');
  ctx.save();
  if (game.shake > 0) {
    ctx.translate((Math.random() - 0.5) * 6 * game.shake, (Math.random() - 0.5) * 6 * game.shake);
  }
  drawKitchen(ctx, game);
  drawStations(ctx, game);
  drawPlayer(ctx, game);
  drawOrderBoard(ctx, game);
  drawHUD(ctx, game);
  drawFlash(ctx, game);
  if (game.phase === 'title') drawTitle(ctx, game);
  if (game.phase === 'gameover') drawGameOver(ctx, game);
  ctx.restore();
}

function drawKitchen(ctx, game) {
  // Floor: warm checker; walls: deep teal with a tiled edge.
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const st = game.grid[y][x];
    const px = x * TILE, py = y * TILE;
    if (st.kind === 'floor') {
      ctx.fillStyle = (x + y) % 2 ? '#d9cdbb' : '#e3d8c6';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = 'rgba(120,100,80,0.14)';
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
    } else {
      ctx.fillStyle = st.kind === 'fridge' ? '#3f5d75' : '#57534e';
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(px, py, TILE, 6);
    }
  }
}

function drawStations(ctx, game) {
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const st = game.grid[y][x];
    const px = x * TILE, py = y * TILE;
    if (st.kind === 'counter') {
      ctx.fillStyle = '#8a7a62'; ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
      ctx.fillStyle = '#a3927a'; ctx.fillRect(px + 2, py + 2, TILE - 4, 8);
    } else if (st.kind === 'board') {
      ctx.fillStyle = '#c9b48a'; ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
      ctx.fillStyle = '#7a6a4e'; ctx.fillRect(px + 6, py + 6, TILE - 12, TILE - 12);
      drawProgress(ctx, st, px, py);
    } else if (st.kind === 'stove') {
      ctx.fillStyle = '#2e3240'; ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
      ctx.fillStyle = st.busy > 0 ? '#e07030' : '#454b5e';
      for (const [ox, oy] of [[12, 12], [32, 12], [12, 32], [32, 32]]) {
        ctx.beginPath(); ctx.arc(px + ox, py + oy, 6, 0, 7); ctx.fill();
      }
      drawProgress(ctx, st, px, py);
    } else if (st.kind === 'plate') {
      ctx.fillStyle = '#b9c2d2'; ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
      const stack = st.stack || [];
      for (let i = 0; i < Math.max(1, stack.length); i++) {
        drawPlateShape(ctx, px + TILE / 2, py + TILE / 2 - i * 4, 16, '#eef1f6');
      }
    } else if (st.kind === 'serving') {
      ctx.fillStyle = '#3f7d54'; ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
      ctx.fillStyle = '#eaf5ee'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Serve', px + TILE / 2, py + TILE / 2 + 4);
    } else if (st.kind === 'bin') {
      ctx.fillStyle = '#7a3f3f'; ctx.fillRect(px + 8, py + 8, TILE - 16, TILE - 16);
      ctx.fillStyle = '#e8d9d9'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('🗑', px + TILE / 2, py + TILE / 2 + 5);
    } else if (st.kind === 'fridge') {
      // Fridge wall bins: each holds one raw ingredient, drawn as a labelled pellet.
      const id = st.held || FRIDGE_LABELS[y * COLS + x];
      const def = id ? INGREDIENTS[id] : null;
      if (def) {
        ctx.fillStyle = '#2e4256'; ctx.fillRect(px + 4, py + 6, TILE - 8, TILE - 12);
        ctx.fillStyle = def.color;
        ctx.beginPath(); ctx.arc(px + TILE / 2, py + TILE / 2, 9, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '7px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(def.name.slice(0, 7).toUpperCase(), px + TILE / 2, py + TILE - 3);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(px + 4, py + 6, TILE - 8, TILE - 12);
      }
    }
    if (st.held && st.kind !== 'fridge') drawItem(ctx, st.held, px + TILE / 2, py + TILE / 2);
  }
}

function drawProgress(ctx, st, px, py) {
  if (st.busy > 0 && st.total) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(px + 4, py + TILE - 8, TILE - 8, 5);
    ctx.fillStyle = '#ffd24b';
    ctx.fillRect(px + 4, py + TILE - 8, (TILE - 8) * st.progress, 5);
  }
}

function drawItem(ctx, item, cx, cy) {
  if (!item) return;
  if (item.type === 'plate') { drawAssembly(ctx, cx, cy, item.items); return; }
  if (item.type === 'dish') { drawAssembly(ctx, cx, cy, item.items); return; }
  drawFood(ctx, item.id, item.type, cx, cy);
}

// Distinct little food portraits per ingredient id, raw vs prepped.
function drawFood(ctx, id, kind, cx, cy) {
  const col = itemColor({ id });
  ctx.lineWidth = 1.5;
  switch (id) {
    case 'bun': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, 9, Math.PI, 0); ctx.fill();
      ctx.fillRect(cx - 9, cy, 18, 4);
      break;
    }
    case 'patty': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(cx, cy, 9, 6, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.stroke();
      break;
    }
    case 'cooked_patty': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(cx, cy, 10, 6, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#3a2418';
      for (const [dx, dy] of [[-4, -1], [2, 1], [4, -2]]) { ctx.fillRect(cx + dx, cy + dy, 2, 1.5); }
      break;
    }
    case 'tomato': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 7); ctx.fill();
      ctx.fillStyle = '#7a8a4a';
      ctx.beginPath(); ctx.arc(cx, cy - 6, 3, 0, 7); ctx.fill();
      break;
    }
    case 'chopped_tomato': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 7); ctx.fill();
      ctx.fillStyle = '#f2b0a5';
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 7); ctx.fill();
      ctx.strokeStyle = '#a33327';
      for (const a of [0.5, 2, 3.6, 5.2]) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8); ctx.stroke(); }
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(cx, cy, 10, 7, 0.4, 0, 7); ctx.fill();
      ctx.strokeStyle = '#3f7d33';
      ctx.beginPath(); ctx.moveTo(cx - 6, cy + 3); ctx.quadraticCurveTo(cx, cy - 6, cx + 6, cy + 3); ctx.stroke();
      break;
    }
    case 'chopped_lettuce': {
      ctx.fillStyle = col;
      for (const [dx, dy, r] of [[-5, -2, 4], [4, -3, 3.5], [0, 4, 4], [6, 3, 3]]) {
        ctx.beginPath(); ctx.arc(cx + dx, cy + dy, r, 0, 7); ctx.fill();
      }
      break;
    }
    case 'onion': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 7); ctx.fill();
      ctx.strokeStyle = '#8a6aa0'; ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8); ctx.stroke();
      break;
    }
    case 'chopped_onion': {
      ctx.fillStyle = col;
      for (const [dx, dy] of [[-4, 0], [3, -2], [1, 3], [-2, 4], [5, 2]]) {
        ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 2.4, 0, 7); ctx.fill();
      }
      break;
    }
    case 'cheese': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(cx - 9, cy + 6); ctx.lineTo(cx + 9, cy + 6); ctx.lineTo(cx, cy - 7); ctx.closePath(); ctx.fill();
      break;
    }
    case 'fish': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(cx, cy, 9, 5, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 8, cy); ctx.lineTo(cx + 13, cy - 4); ctx.lineTo(cx + 13, cy + 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(cx - 4, cy - 1, 1.3, 0, 7); ctx.fill();
      break;
    }
    case 'cooked_fish': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(cx, cy, 10, 5, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#7a4a68';
      for (const dx of [-4, 0, 4]) { ctx.beginPath(); ctx.moveTo(cx + dx, cy - 4); ctx.lineTo(cx + dx, cy + 4); ctx.stroke(); }
      break;
    }
    case 'rice': {
      ctx.fillStyle = '#7a8a9c';
      ctx.beginPath(); ctx.arc(cx, cy + 2, 9, 0, Math.PI); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(cx, cy, 8, 4, 0, 0, 7); ctx.fill();
      break;
    }
    case 'rice_bowl': {
      ctx.fillStyle = '#7a8a9c';
      ctx.beginPath(); ctx.arc(cx, cy + 2, 9, 0, Math.PI); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(cx, cy, 8, 4, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff';
      for (const [dx, dy] of [[-4, -1], [1, -2], [4, 0], [-1, 1]]) { ctx.fillRect(cx + dx, cy + dy, 2, 1.5); }
      break;
    }
    case 'seaweed': {
      ctx.fillStyle = col;
      ctx.fillRect(cx - 8, cy - 6, 16, 12);
      ctx.strokeStyle = '#2a4632';
      ctx.strokeRect(cx - 8, cy - 6, 16, 12);
      break;
    }
    case 'chopped_seaweed': {
      ctx.fillStyle = col;
      for (const [dx, dy, w] of [[-6, -3, 5], [1, -1, 6], [-2, 3, 5], [4, 3, 4]]) { ctx.fillRect(cx + dx, cy + dy, w, 2.5); }
      break;
    }
    case 'dough': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 7); ctx.fill();
      ctx.strokeStyle = '#c9a86a';
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 7); ctx.stroke();
      break;
    }
    case 'baked_crust': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, 7); ctx.fill();
      ctx.fillStyle = '#b5823a';
      for (const a of [0.6, 2.2, 3.8, 5.4]) { ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6, 1.8, 0, 7); ctx.fill(); }
      break;
    }
    case 'sauce': {
      ctx.fillStyle = '#a33327';
      ctx.fillRect(cx - 6, cy - 8, 12, 15);
      ctx.fillStyle = '#7a2620';
      ctx.fillRect(cx - 3, cy - 11, 6, 3);
      ctx.fillStyle = '#e8d9d9';
      ctx.fillRect(cx - 4, cy - 3, 8, 5);
      break;
    }
    case 'mushroom': {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy - 2, 8, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#e8dcc8';
      ctx.fillRect(cx - 3, cy - 2, 6, 8);
      break;
    }
    case 'chopped_mushroom': {
      ctx.fillStyle = col;
      for (const [dx, dy] of [[-4, -1], [3, 0], [-1, 4]]) { ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 3, 0, 7); ctx.fill(); }
      break;
    }
    default: {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 7); ctx.fill();
    }
  }
  if (kind === 'prepped') {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, 7); ctx.stroke();
  }
}

// A plate with stacked food layers, drawn tall enough to read mid-assembly.
function drawAssembly(ctx, cx, cy, items) {
  drawPlateShape(ctx, cx, cy, 15, '#f4f6fa');
  items.forEach((id, i) => {
    drawFood(ctx, id, 'prepped', cx, cy - 6 - i * 5);
  });
}

function drawPlateShape(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.7, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.stroke();
}

function drawPlayer(ctx, game) {
  const p = game.player;
  const bob = Math.sin(p.step * 2) * 1.5;
  // Chef: white coat, apron, hat.
  ctx.fillStyle = '#f5f2ec';
  ctx.fillRect(p.x - 12, p.y - 14 + bob, 24, 26);
  ctx.fillStyle = '#c2543e';
  ctx.fillRect(p.x - 12, p.y + 2 + bob, 24, 8);
  ctx.fillStyle = '#e8c39e';
  ctx.beginPath(); ctx.arc(p.x, p.y - 20 + bob, 9, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(p.x - 10, p.y - 30 + bob, 20, 7);
  ctx.fillRect(p.x - 8, p.y - 33 + bob, 16, 4);
  // Face toward facing direction.
  ctx.fillStyle = '#333';
  const fx = p.facing.x * 3, fy = p.facing.y * 2;
  ctx.beginPath(); ctx.arc(p.x - 3 + fx, p.y - 20 + bob + fy, 1.6, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(p.x + 3 + fx, p.y - 20 + bob + fy, 1.6, 0, 7); ctx.fill();
  if (p.held) drawItem(ctx, p.held, p.x, p.y + 20 + bob);
}

function drawOrderBoard(ctx, game) {
  const orders = game.board.orders;
  const bw = 118, bh = 92, gap = 10;
  const x0 = W - bw - 12, y0 = 12;
  ctx.fillStyle = 'rgba(30,32,40,0.88)';
  ctx.fillRect(x0 - 8, y0 - 8, bw + 16, Math.max(bh, orders.length * (bh + gap)) + 16);
  orders.forEach((o, i) => {
    const x = x0, y = y0 + i * (bh + gap);
    const frac = Math.max(0, o.patience / o.maxPatience);
    ctx.fillStyle = o.tint; ctx.globalAlpha = 0.25 + 0.75 * (0.4 + 0.6 * frac);
    ctx.fillRect(x, y, bw, bh); ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(o.name, x + 8, y + 16);
    // Required items as colored dots.
    o.items.forEach((id, k) => {
      const def = INGREDIENTS[id] || PREPPED[id];
      ctx.fillStyle = def ? def.color : '#888';
      ctx.beginPath(); ctx.arc(x + 14 + k * 20, y + 34, 7, 0, 7); ctx.fill();
      if (def && (def.name || '').startsWith('Chop')) { ctx.strokeStyle = '#fff'; ctx.stroke(); }
    });
    // Patience bar.
    ctx.fillStyle = frac > 0.5 ? '#5fae4a' : frac > 0.22 ? '#d9a05b' : '#d84b3a';
    ctx.fillRect(x + 8, y + bh - 14, (bw - 16) * frac, 7);
  });
}

function drawHUD(ctx, game) {
  ctx.fillStyle = 'rgba(30,32,40,0.88)';
  ctx.fillRect(8, 8, 190, 40);
  ctx.fillStyle = '#ffd24b'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('$' + game.score, 16, 28);
  ctx.fillStyle = '#e2634f';
  for (let i = 0; i < game.lives; i++) { ctx.fillText('♥', 92 + i * 16, 28); }
  ctx.fillStyle = '#9fb6c9'; ctx.font = '11px sans-serif';
  ctx.fillText('Combo x' + (1 + Math.min(0.5, game.combo * 0.1)).toFixed(1), 16, 42);
  // Held item label bottom-left.
  if (game.player.held) {
    ctx.fillStyle = 'rgba(30,32,40,0.85)';
    ctx.fillRect(8, H - 30, 210, 22);
    ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif';
    ctx.fillText('Holding: ' + itemName(game.player.held), 14, H - 14);
  }
}

function drawFlash(ctx, game) {
  if (!game.flash) return;
  ctx.fillStyle = 'rgba(20,22,30,0.85)';
  const t = game.flash.text;
  ctx.font = 'bold 15px sans-serif';
  const w = ctx.measureText(t).width + 24;
  ctx.fillRect(W / 2 - w / 2, H * 0.16, w, 32);
  ctx.fillStyle = '#ffd24b'; ctx.textAlign = 'center';
  ctx.fillText(t, W / 2, H * 0.16 + 22);
}

function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(20,22,28,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd24b'; ctx.font = 'bold 42px serif';
  ctx.fillText('🍳 Sizzle Rush', W / 2, H * 0.32);
  ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif';
  ctx.fillText('Cook the orders before patience runs out.', W / 2, H * 0.42);
  ctx.fillText('Arrows / WASD move · SPACE use station · fridge bins give ingredients', W / 2, H * 0.47);
  ctx.fillText('Chop 🔪 on boards, cook on stoves, stack plates, serve at the green window.', W / 2, H * 0.52);
  ctx.fillStyle = '#ffd24b'; ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Press SPACE to start', W / 2, H * 0.62);
}

function drawGameOver(ctx, game) {
  ctx.fillStyle = 'rgba(20,22,28,0.78)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e2634f'; ctx.font = 'bold 36px sans-serif';
  ctx.fillText('Kitchen Closed!', W / 2, H * 0.34);
  ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif';
  ctx.fillText('Final earnings: $' + game.score, W / 2, H * 0.44);
  ctx.fillText('Served ' + game.board.servedCount + ' · Missed ' + game.board.failedCount, W / 2, H * 0.49);
  ctx.fillStyle = '#ffd24b';
  ctx.fillText('Press SPACE for a fresh service', W / 2, H * 0.58);
}
