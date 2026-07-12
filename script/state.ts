import { LANG_DEFAULT } from './lang/index';

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

export type TabId = 'recipes' | 'fridge' | 'addRecipe';

export type State = {
  lang: string;
  ingredients: Ingredient[];
  fridge: {
    [ingredientId: string]: FridgeEntry;
  };
  recipes: Recipe[];

  activeTab: TabId;
  editingRecipeId?: string | null;
  filterOpen: boolean;
  recipeSearch: string;
  viewEl: HTMLElement;
  draftItems: {
    forId?: string;
    items: (
      | RecipeItem
      | { ingredientId: null; name: ''; amount: null; unit: null }
    )[];
  };
  draftName?: string;
  draftDesc?: string;
};

export const defaultState = {
  lang: LANG_DEFAULT,
  ingredients: [],
  fridge: {},
  recipes: [],
};

window.state = {
  ...defaultState,

  activeTab:
    (new URLSearchParams(window.location.search).get('tab') as TabId) ||
    'recipes',
  editingRecipeId: null,
  filterOpen: true,
  recipeSearch: '',
  viewEl: null as unknown as HTMLElement,
  draftName: '',
  draftDesc: '',
  draftItems: {
    forId: 'new',
    items: [],
  },
};
