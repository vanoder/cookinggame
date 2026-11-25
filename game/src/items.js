// Sizzle Rush — item helpers: ingredient, prepped item, plate stack, recipes.
import { INGREDIENTS, PREPPED, RECIPES } from './config.js';

// Every holdable item is a small object: { type: 'ingredient'|'prepped'|'plate'|'dish', id, items? }.
export function makeItem(id) {
  if (INGREDIENTS[id]) return { type: 'ingredient', id };
  if (PREPPED[id]) return { type: 'prepped', id };
  return null;
}

export function itemName(item) {
  if (!item) return '';
  if (item.type === 'plate') return item.items.length ? 'Plate (' + item.items.length + ')' : 'Clean Plate';
  if (item.type === 'dish') return dishName(item);
  return (INGREDIENTS[item.id] || PREPPED[item.id] || { name: item.id }).name;
}

export function itemColor(item) {
  if (!item) return '#333';
  if (item.type === 'plate' || item.type === 'dish') return '#f2f2f2';
  return (INGREDIENTS[item.id] || PREPPED[item.id] || { color: '#888' }).color;
}

export function makePlate() {
  return { type: 'plate', id: 'plate', items: [] };
}

export function dishName(dish) {
  const r = RECIPES.find(r => r.id === dish.recipe);
  return r ? r.name : 'Mystery Dish';
}

// Match a plate's items against the recipe book. Returns { recipe, reward } or { recipe: null }.
export function matchPlate(plate) {
  const items = [...plate.items].sort();
  for (const r of RECIPES) {
    const want = [...r.items].sort();
    if (want.length === items.length && want.every((w, i) => w === items[i])) {
      return { recipe: r.id, reward: r.reward };
    }
  }
  return { recipe: null, reward: 0 };
}

// Visual layering used by the renderer: each item's color in a plate/dish stack.
export function stackColors(plate) {
  return plate.items.map(id => (INGREDIENTS[id] || PREPPED[id] || { color: '#888' }).color);
}
