import { LANG_DEFAULT, type LANG } from '../lang/lang.ts';
import type { TabId } from '../components/tabs/tabs.ts';
import type { IconId } from '../icons/icon-map.ts';

export type IngredientName = Partial<Record<LANG, string>>;

export type Ingredient = {
  id: string;
  name: IngredientName;
  iconId?: IconId;
  // Only set for ingredients sourced from the server catalog; used to
  // decide whether a resync should overwrite name/iconId.
  updatedAt?: string;
};

export type FridgeEntry = {
  inStock: boolean;
  amount: number | null;
  unit: string | null;
};

export type RecipeItem = {
  ingredientId: string;
  name: string;
  amount: number | null;
  unit: string | null;
};

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Recipe = {
  id: string;
  name: string;
  description: string;
  items: RecipeItem[];
  mealTypes?: MealType[];
};

export type State = {
  lang: LANG;
  ingredients: Ingredient[];
  fridge: {
    [ingredientId: string]: FridgeEntry;
  };
  recipes: Recipe[];
  serverBaseUrl: string;

  activeTab: TabId;
  editingRecipeId?: string | null;
};

export const DEFAULT_SERVER_BASE_URL = 'http://localhost:3001';

export const defaultState: State = {
  lang: LANG_DEFAULT,
  ingredients: [],
  fridge: {},
  recipes: [],
  serverBaseUrl: DEFAULT_SERVER_BASE_URL,

  activeTab: 'recipes',
  editingRecipeId: null,
};
