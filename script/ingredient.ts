import type { IconId } from './icons/icon-map.ts';
import type { Recipe, RecipeItem } from './store/state.ts';
import { stateStore } from './store/store.ts';
import { uid } from './utils.ts';

export function findIngredientByName(name: string) {
  const norm = name.trim().toLowerCase();
  return stateStore
    .getState()
    .ingredients.find((i) => i.name.toLowerCase() === norm);
}

export function getOrCreateIngredient(name: string, iconId?: IconId) {
  name = name.trim();
  if (!name) return null;
  let ing = findIngredientByName(name);
  if (!ing) {
    ing = { id: uid(), name, iconId };
    stateStore.addIngredient(ing);
  }
  return ing;
}

export function fridgeEntry(ingredientId: string) {
  return (
    stateStore.getState().fridge[ingredientId] || {
      inStock: false,
      amount: null,
      unit: null,
    }
  );
}

export function ingredientName(id: string) {
  const ing = stateStore.getState().ingredients.find((i) => i.id === id);
  return ing ? ing.name : '—';
}

export type EvaluateRecipeResult = {
  matched: number;
  total: number;
  missingList: RecipeItem[];
  warnList: RecipeItem[];
  status: 'none' | 'partial' | 'full';
};

export function evaluateRecipe(recipe: Recipe): EvaluateRecipeResult {
  const total = recipe.items.length;
  let matched = 0;
  let missingList: RecipeItem[] = [];
  let warnList: RecipeItem[] = []; // present but amount insufficient / unspecified concern
  recipe.items.forEach((item) => {
    const fe = fridgeEntry(item.ingredientId);
    if (!fe.inStock) {
      missingList.push(item);
      return;
    }
    // present. check amount if both specified with same unit
    if (
      item.amount != null &&
      fe.amount != null &&
      item.unit &&
      fe.unit &&
      item.unit.trim().toLowerCase() === fe.unit.trim().toLowerCase()
    ) {
      if (fe.amount + 1e-9 >= item.amount) {
        matched++;
      } else {
        warnList.push(item); // not enough
      }
    } else {
      matched++; // presence is enough when we can't compare precisely
    }
  });
  let status: 'none' | 'partial' | 'full' = 'none';
  if (total === 0) status = 'none';
  else if (matched === total) status = 'full';
  else if (matched + warnList.length >= total && matched > 0)
    status = 'partial';
  else if (matched > 0 || warnList.length > 0) status = 'partial';
  else status = 'none';
  return { matched, total, missingList, warnList, status };
}
