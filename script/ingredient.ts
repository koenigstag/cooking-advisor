import type { IconId } from './icons/icon-map.ts';
import type { LANG } from './lang/lang.ts';
import type {
  Ingredient,
  IngredientName,
  IngredientTag,
  Recipe,
  RecipeItem,
} from './store/state.ts';
import { stateStore } from './store/store.ts';
import { uid } from './utils.ts';

export function ingredientDisplayName(
  name: IngredientName,
  lang: LANG = stateStore.getState().lang as LANG
): string {
  return name[lang] ?? name.en ?? name.ru ?? '';
}

export function findIngredientByName(name: string) {
  const norm = name.trim().toLowerCase();
  return stateStore
    .getState()
    .ingredients.find((i) =>
      Object.values(i.name).some((v) => v && v.toLowerCase() === norm)
    );
}

export function getOrCreateIngredient(
  name: string,
  iconId?: IconId,
  lang: LANG = stateStore.getState().lang as LANG,
  tags?: IngredientTag[]
) {
  name = name.trim();
  if (!name) return null;
  let ing = findIngredientByName(name);
  if (!ing) {
    ing = { id: uid(), name: { [lang]: name }, iconId, tags: tags?.length ? tags : undefined };
    stateStore.addIngredient(ing);
  } else if (tags?.length) {
    const merged = Array.from(new Set([...(ing.tags ?? []), ...tags]));
    if (merged.length !== (ing.tags?.length ?? 0)) {
      ing.tags = merged;
      stateStore.setIngredients([...stateStore.getState().ingredients]);
    }
  }
  return ing;
}

// Inserts an ingredient sourced from the server catalog if it isn't known
// locally yet. If it's already known, only refreshes name/icon/tags when the
// server's copy is newer (server-dictated fields only — fridge amount/unit
// stay purely local and are never touched here).
export function upsertIngredientFromCatalog(entry: Ingredient): Ingredient {
  const ingredients = stateStore.getState().ingredients;
  const existing = ingredients.find((i) => i.id === entry.id);
  if (existing) {
    const isNewer =
      entry.updatedAt != null &&
      (existing.updatedAt == null ||
        new Date(entry.updatedAt) > new Date(existing.updatedAt));
    if (isNewer) {
      existing.name = entry.name;
      existing.iconId = entry.iconId as IconId | undefined;
      existing.tags = entry.tags;
      existing.updatedAt = entry.updatedAt;
      stateStore.setIngredients([...ingredients]);
    }
    return existing;
  }
  stateStore.addIngredient(entry);
  return entry;
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
  return ing ? ingredientDisplayName(ing.name) : '—';
}

// An ingredient is blocked either by explicit id (manual, one-off exception)
// or because it carries a tag the user has blocked (the primary mechanism —
// this also covers ingredients added after the tag was blocked).
export function isIngredientBlocked(ingredientId: string): boolean {
  const { blocklist, blockedTags } = stateStore.getState().dietary;
  if (blocklist.includes(ingredientId)) return true;
  if (blockedTags.length === 0) return false;
  const ing = stateStore.getState().ingredients.find((i) => i.id === ingredientId);
  return !!ing?.tags?.some((tag) => blockedTags.includes(tag));
}

// Recipe items don't always carry an ingredientId (library recipes only
// have a plain name), so this resolves one by looking up the local
// ingredient list by name as a fallback.
export function resolveIngredientId(item: {
  ingredientId?: string;
  name: string;
}): string | undefined {
  return item.ingredientId ?? findIngredientByName(item.name)?.id;
}

// Display names of any blocklisted ingredients found among the given
// recipe items. Works for both local recipes (RecipeItem[], has
// ingredientId) and library recipes (LibraryRecipeItem[], name only).
export function blockedIngredientNames(
  items: { ingredientId?: string; name: string }[]
): string[] {
  const { blocklist, blockedTags } = stateStore.getState().dietary;
  if (blocklist.length === 0 && blockedTags.length === 0) return [];
  const names: string[] = [];
  items.forEach((item) => {
    const id = resolveIngredientId(item);
    if (id && isIngredientBlocked(id)) {
      names.push(ingredientName(id));
    }
  });
  return names;
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
