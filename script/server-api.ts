import type { MealType, Recipe } from './store/state.ts';

export const SERVER_BASE_URL = 'http://localhost:3001';

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
  createdAt: string;
};

export async function fetchLibraryRecipes(): Promise<LibraryRecipe[]> {
  const res = await fetch(`${SERVER_BASE_URL}/recipes`);
  if (!res.ok) throw new Error(`Failed to load recipe library (${res.status})`);
  return res.json();
}

export async function publishRecipeToLibrary(
  recipe: Recipe
): Promise<LibraryRecipe> {
  const res = await fetch(`${SERVER_BASE_URL}/recipes`, {
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
    }),
  });
  if (!res.ok) throw new Error(`Failed to publish recipe (${res.status})`);
  return res.json();
}
