// Sizzle Rush — config: tile layout, ingredient and recipe definitions.
export const TILE = 44;                 // one kitchen tile in pixels
export const COLS = 15;                 // kitchen width in tiles
export const ROWS = 10;                 // kitchen height in tiles
export const W = COLS * TILE;           // canvas width
export const H = ROWS * TILE;           // canvas height

export const PLAYER_SPEED = 2.6;        // px per tick at 60fps

// Stations: what sits on each kitchen tile.
export const STATIONS = {
  counter:   { name: 'Counter',   color: '#7a6a55' },
  board:     { name: 'Chop Board',color: '#9c8a6e', action: 'chop' },
  stove:     { name: 'Stove',     color: '#4b4f5e', action: 'cook', takes: 'pan' },
  plate:     { name: 'Plate',     color: '#cfd6e4', action: 'plate' },
  serving:   { name: 'Serving',   color: '#3f7d54', action: 'serve' },
  bin:       { name: 'Bin',       color: '#8a4444', action: 'trash' },
  fridge:    { name: 'Fridge',    color: '#5e7d9c', action: 'none' },
};

// Ingredients the kitchen stocks. prep: what the chop board or stove turns them into.
export const INGREDIENTS = {
  tomato:    { name: 'Tomato',    color: '#d84b3a', prep: { chop: 'chopped_tomato' } },
  lettuce:   { name: 'Lettuce',   color: '#5fae4a', prep: { chop: 'chopped_lettuce' } },
  onion:     { name: 'Onion',     color: '#c9b7d8', prep: { chop: 'chopped_onion' } },
  bun:       { name: 'Bun',       color: '#d9a05b', prep: {} },
  patty:     { name: 'Patty',     color: '#7a4432', prep: { cook: 'cooked_patty' } },
  cheese:    { name: 'Cheese',    color: '#e8b84b', prep: {} },
  fish:      { name: 'Fish',      color: '#b8749c', prep: { cook: 'cooked_fish' } },
  rice:      { name: 'Rice',      color: '#e8e4da', prep: { cook: 'rice_bowl' } },
  seaweed:   { name: 'Seaweed',   color: '#3a5e44', prep: { chop: 'chopped_seaweed' } },
  dough:     { name: 'Dough',     color: '#e3cf9e', prep: { cook: 'baked_crust' } },
  sauce:     { name: 'Sauce',     color: '#a33327', prep: {} },
  mushroom:  { name: 'Mushroom',  color: '#b09878', prep: { chop: 'chopped_mushroom' } },
};

// Derived (prepped) items.
export const PREPPED = {
  chopped_tomato:     { name: 'Chopped Tomato',    color: '#e2634f', base: 'tomato' },
  chopped_lettuce:    { name: 'Chopped Lettuce',   color: '#7cc45f', base: 'lettuce' },
  chopped_onion:      { name: 'Chopped Onion',     color: '#dccbe8', base: 'onion' },
  chopped_seaweed:    { name: 'Chopped Seaweed',   color: '#4f7a58', base: 'seaweed' },
  chopped_mushroom:   { name: 'Chopped Mushroom',  color: '#c4ae8c', base: 'mushroom' },
  cooked_patty:       { name: 'Grilled Patty',     color: '#5e3424', base: 'patty' },
  cooked_fish:        { name: 'Grilled Fish',      color: '#cf8cb0', base: 'fish' },
  rice_bowl:          { name: 'Steamed Rice',      color: '#f2efe6', base: 'rice' },
  baked_crust:        { name: 'Baked Crust',       color: '#d9b264', base: 'dough' },
};

// Recipes: plate combinations judged by exact item set.
export const RECIPES = [
  { id: 'burger',   name: 'Classic Burger',  items: ['bun', 'cooked_patty', 'chopped_lettuce', 'chopped_onion'], reward: 30 },
  { id: 'cheeseburger', name: 'Cheese Burger', items: ['bun', 'cooked_patty', 'cheese', 'chopped_tomato'],      reward: 32 },
  { id: 'salad',    name: 'Garden Salad',    items: ['chopped_lettuce', 'chopped_tomato', 'chopped_onion'],      reward: 22 },
  { id: 'fishrice', name: 'Fish Rice Bowl',  items: ['rice_bowl', 'cooked_fish', 'chopped_seaweed'],             reward: 28 },
  { id: 'sushi',    name: 'Green Sushi',     items: ['rice_bowl', 'chopped_seaweed', 'chopped_mushroom'],        reward: 26 },
  { id: 'pizza',    name: 'Moon Pizza',      items: ['baked_crust', 'sauce', 'cheese', 'chopped_mushroom'],      reward: 34 },
  { id: 'toast',    name: 'Sauce Toast',     items: ['baked_crust', 'sauce', 'chopped_tomato'],                  reward: 20 },
];

// Difficulty: how order count and patience scale per served order.
export const DIFFICULTY = {
  start_patience: 95,      // seconds before an order expires
  patience_decay: 0.965,   // patience multiplier per served order
  max_orders: 4,           // concurrent orders cap
  order_every: 11,         // seconds between new orders (shrinks)
  order_every_decay: 0.97,
};
