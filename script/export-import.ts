import { saveData } from './database';
import { getOrCreateIngredient, ingredientName } from './ingredient';
import type { RecipeItem, State } from './state';
import { uid } from './utils';

type ExportPayload = {
  format: 'chef-finder-recipes';
  version: number;
  exportedAt: string;
  recipes: {
    name: string;
    description: string;
    items: {
      ingredient: string;
      amount: number | null;
      unit: string | null;
    }[];
  }[];
};

export async function exportRecipes(): Promise<{
  success: boolean;
  message?: string;
  click?: () => void;
}> {
  if (window.state.recipes.length === 0) {
    return {
      success: false,
      message: 'No recipes available for export.',
    };
  }
  const payload: ExportPayload = {
    format: 'chef-finder-recipes',
    version: 1,
    exportedAt: new Date().toISOString(),
    recipes: window.state.recipes.map((r) => ({
      name: r.name,
      description: r.description || '',
      items: r.items.map((it) => ({
        ingredient: ingredientName(it.ingredientId),
        amount: it.amount,
        unit: it.unit,
      })),
    })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  return {
    success: true,
    click: () => {
      const stamp = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recipes-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  };
}

export async function importRecipesFromPayload(
  payload: ExportPayload
): Promise<{
  success: boolean;
  message?: string;
  added?: number;
  replaced?: number;
  skipped?: number;
}> {
  if (!payload || !Array.isArray(payload.recipes)) {
    return {
      success: false,
      message: 'Invalid payload: missing "recipes" array.',
    };
  }
  let added = 0,
    replaced = 0,
    skipped = 0;
  payload.recipes.forEach((raw) => {
    const name = ((raw && raw.name) || '').trim();
    if (!name || !Array.isArray(raw.items)) {
      skipped++;
      return;
    }
    const items: RecipeItem[] = [];
    raw.items.forEach((it) => {
      const ingName = ((it && it.ingredient) || '').trim();
      if (!ingName) return;
      const ing = getOrCreateIngredient(ingName);

      if (!ing) return;

      items.push({
        ingredientId: ing.id,
        name: ing.name,
        amount:
          it.amount === undefined || it.amount === null || it.amount === 0
            ? null
            : Number(it.amount),
        unit: it.unit ? String(it.unit).trim() : null,
      });
    });
    if (items.length === 0) {
      skipped++;
      return;
    }

    const existing = window.state.recipes.find(
      (r) => r.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      existing.description = raw.description || '';
      existing.items = items;
      replaced++;
    } else {
      window.state.recipes.push({
        id: uid(),
        name,
        description: raw.description || '',
        items,
      });
      added++;
    }
  });
  saveData();

  return {
    success: true,
  };
}
