import { LANG_DEFAULT, type LANG } from '../lang/index';
import type { TabId } from '../tabs';

export type Ingredient = {
  id: string;
  name: string;
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

export type Recipe = {
  id: string;
  name: string;
  description: string;
  items: RecipeItem[];
};

export type State = {
  lang: LANG;
  ingredients: Ingredient[];
  fridge: {
    [ingredientId: string]: FridgeEntry;
  };
  recipes: Recipe[];

  activeTab: TabId;
  editingRecipeId?: string | null;
};

export const defaultState = {
  lang: LANG_DEFAULT,
  ingredients: [],
  fridge: {},
  recipes: [],
};
