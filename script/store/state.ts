import { LANG_DEFAULT, type LANG } from '../lang/lang.ts';
import type { TabId } from '../components/tabs/tabs.ts';
import type { IconId } from '../icons/icon-map.ts';

export type IngredientName = Partial<Record<LANG, string>>;

export type IngredientTag =
  | 'dairy'
  | 'egg'
  | 'gluten'
  | 'vegetable'
  | 'meat'
  | 'pork'
  | 'beef'
  | 'poultry'
  | 'fish'
  | 'shellfish'
  | 'nuts'
  | 'peanut'
  | 'soy'
  | 'sesame'
  | 'alcohol'
  | 'honey'
  | 'citrus';

export const INGREDIENT_TAGS: IngredientTag[] = [
  'dairy',
  'egg',
  'gluten',
  'vegetable',
  'meat',
  'pork',
  'beef',
  'poultry',
  'fish',
  'shellfish',
  'nuts',
  'peanut',
  'soy',
  'sesame',
  'alcohol',
  'honey',
  'citrus',
];

export type Ingredient = {
  id: string;
  name: IngredientName;
  iconId?: IconId;
  tags?: IngredientTag[];
  // kcal per 100g. Optional, and only meaningful for ingredients measured
  // by weight — used to estimate a recipe's total calories.
  calories?: number;
  // Only set for ingredients sourced from the server catalog; used to
  // decide whether a resync should overwrite name/iconId/tags.
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
  // Manual override for the recipe's total calories (kcal). When unset, an
  // estimate is computed from the ingredients' calories fields instead.
  calories?: number;
  // Used with calories (manual or estimated) to show a per-serving figure.
  servings?: number;
};

export type DietaryAction = 'warn' | 'hide';

export type DietarySettings = {
  blocklist: string[]; // ingredient ids — manual, one-off exceptions
  blockedTags: IngredientTag[]; // primary mechanism — blocks any ingredient carrying one of these tags, including ones added later
  action: DietaryAction;
};

export type State = {
  lang: LANG;
  ingredients: Ingredient[];
  fridge: {
    [ingredientId: string]: FridgeEntry;
  };
  recipes: Recipe[];
  serverBaseUrl: string;
  dietary: DietarySettings;

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
  dietary: { blocklist: [], blockedTags: [], action: 'warn' },

  activeTab: 'recipes',
  editingRecipeId: null,
};
