import type { LANG } from './lang/lang.ts';
import type { IconId } from './icons/icon-map.ts';
import type { IngredientName, IngredientTag, MealType, Recipe } from './store/state.ts';
import { stateStore } from './store/store.ts';

export function getServerBaseUrl(): string {
  return stateStore.getState().serverBaseUrl;
}

export type ServerIngredient = {
  id: string;
  name: IngredientName;
  iconId?: IconId;
  tags?: IngredientTag[];
  updatedAt: string;
};

export async function fetchIngredients(): Promise<ServerIngredient[]> {
  const baseUrl = getServerBaseUrl();
  if (!baseUrl) return [];
  const res = await fetch(`${baseUrl}/ingredients`);
  if (!res.ok)
    throw new Error(`Failed to load ingredient catalog (${res.status})`);
  return res.json();
}

export type LibraryRecipeItem = {
  name: string;
  amount: number | null;
  unit: string | null;
};

export type LibraryRecipe = {
  id: string;
  name: string;
  description: string;
  items: LibraryRecipeItem[];
  mealTypes?: MealType[];
  lang?: LANG;
  createdAt: string;
  // Not currently sent by publishRecipeToLibrary — display-only for now,
  // in case the server starts returning them.
  servings?: number;
  calories?: number;
};

export async function fetchLibraryRecipes(lang: LANG): Promise<LibraryRecipe[]> {
  const baseUrl = getServerBaseUrl();
  if (!baseUrl) return [];
  const res = await fetch(
    `${baseUrl}/recipes?lang=${encodeURIComponent(lang)}`
  );
  if (!res.ok) throw new Error(`Failed to load recipe library (${res.status})`);
  return res.json();
}

export async function publishRecipeToLibrary(
  recipe: Recipe,
  lang: LANG
): Promise<LibraryRecipe | null> {
  const baseUrl = getServerBaseUrl();
  if (!baseUrl) return null;
  const res = await fetch(`${baseUrl}/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: recipe.name,
      description: recipe.description,
      items: recipe.items.map((item) => ({
        name: item.name,
        amount: item.amount,
        unit: item.unit,
      })),
      mealTypes: recipe.mealTypes,
      lang,
    }),
  });
  if (!res.ok) throw new Error(`Failed to publish recipe (${res.status})`);
  return res.json();
}
