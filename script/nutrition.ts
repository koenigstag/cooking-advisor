import { LANG_EN_US } from './lang/en_US.ts';
import { LANG_RU_RU } from './lang/ru_RU.ts';
import type { Ingredient, Recipe, RecipeItem } from './store/state.ts';

// RecipeItem.unit is free text (whatever the user typed or picked from the
// datalist), not a fixed enum, so there's no reliable way to convert every
// unit to grams. Only gram/kilogram — in either language, since a recipe's
// items may have been entered under a different locale than the one
// currently active — are recognized; anything else (pcs, tbsp, cup, ...)
// is skipped and the resulting estimate is marked partial.
const GRAM_LABELS = new Set(
  [LANG_EN_US.units.gram, LANG_RU_RU.units.gram, 'g', 'gram', 'grams'].map(
    (s) => s.toLowerCase()
  )
);
const KILOGRAM_LABELS = new Set(
  [
    LANG_EN_US.units.kilogram,
    LANG_RU_RU.units.kilogram,
    'kg',
    'kilogram',
    'kilograms',
  ].map((s) => s.toLowerCase())
);

function unitToGrams(unit: string | null, amount: number | null): number | null {
  if (!unit || amount == null) return null;
  const normalized = unit.trim().toLowerCase();
  if (GRAM_LABELS.has(normalized)) return amount;
  if (KILOGRAM_LABELS.has(normalized)) return amount * 1000;
  return null;
}

export type CalorieEstimate = {
  kcal: number;
  // true if at least one item couldn't be counted (unknown/non-weight unit,
  // or the ingredient has no calories value set) — the total is a lower bound.
  partial: boolean;
};

// Returns null when nothing at all could be estimated (no item both has a
// gram-convertible amount and an ingredient with calories set).
export function estimateRecipeCalories(
  items: RecipeItem[],
  ingredients: Ingredient[]
): CalorieEstimate | null {
  let kcal = 0;
  let anyCounted = false;
  let anySkipped = false;

  for (const item of items) {
    const ingredient = ingredients.find((i) => i.id === item.ingredientId);
    const grams = unitToGrams(item.unit, item.amount);
    if (!ingredient?.calories || grams == null) {
      anySkipped = true;
      continue;
    }
    kcal += (ingredient.calories / 100) * grams;
    anyCounted = true;
  }

  if (!anyCounted) return null;
  return { kcal: Math.round(kcal), partial: anySkipped };
}

export type CaloriesPerServing = {
  kcal: number;
  // true when the underlying total is an estimate rather than the recipe's
  // own manually-entered calories value.
  isEstimate: boolean;
  partial: boolean;
};

export function caloriesPerServing(
  recipe: Recipe,
  estimate: CalorieEstimate | null
): CaloriesPerServing | null {
  const servings = recipe.servings && recipe.servings > 0 ? recipe.servings : 1;
  if (recipe.calories != null) {
    return { kcal: Math.round(recipe.calories / servings), isEstimate: false, partial: false };
  }
  if (!estimate) return null;
  return {
    kcal: Math.round(estimate.kcal / servings),
    isEstimate: true,
    partial: estimate.partial,
  };
}
