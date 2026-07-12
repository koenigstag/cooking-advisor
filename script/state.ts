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

export type TabId = 'recipes' | 'fridge' | 'add';

export type State = {
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

  ingredients: Ingredient[];
  fridge: {
    [ingredientId: string]: FridgeEntry;
  };
  recipes: Recipe[];
};

window.state = {
  activeTab: 'recipes',
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

  ingredients: [],
  fridge: {},
  recipes: [],
};
