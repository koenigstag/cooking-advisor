import { LANG_DEFAULT, type LANG } from '../lang/lang.ts';
import type { TabId } from '../components/tabs/tabs.ts';
import type { IconId } from '../icons/icon-map.ts';

export type Ingredient = {
  id: string;
  name: string;
  iconId?: IconId;
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

export const defaultState: State = {
  lang: LANG_DEFAULT,
  ingredients: [],
  fridge: {},
  recipes: [],

  activeTab: 'recipes',
  editingRecipeId: null,
};
