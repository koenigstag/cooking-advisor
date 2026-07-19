import { saveData } from './database.ts';
import { upsertIngredientFromCatalog } from './ingredient.ts';
import { fetchIngredients, type ServerIngredient } from './server-api.ts';

// Runs at app startup (and can be re-run any time). Mirrors the server's
// ingredient catalog into the local ingredients list: adds any server
// ingredient not yet known locally (by id), and refreshes name/icon for
// already-known ones whose server copy is newer. No fridge stock is ever
// touched — this only makes ingredients selectable/consistent across
// clients. If the server is unreachable, this is a no-op (matches how the
// recipe library behaves when unreachable).
export async function syncIngredientCatalog(): Promise<void> {
  let serverIngredients: ServerIngredient[] = [];
  try {
    serverIngredients = await fetchIngredients();
  } catch (e) {
    console.warn('Could not reach the ingredient catalog server', e);
    return;
  }

  serverIngredients.forEach((entry) => upsertIngredientFromCatalog(entry));

  await saveData();
}
