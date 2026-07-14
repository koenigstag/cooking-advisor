import { defaultState, type State } from './state.ts';
import { onActiveTabChange, type TabId } from '../components/tabs/tabs.ts';
import type { LANG } from '../lang/lang.ts';
import { loadData } from '../database.ts';

let state: State = {
  ...defaultState,
};
type Listener = () => void;
const listeners = new Set<Listener>();

export const stateStore = {
  async initialize() {
    const data = await loadData();
    this.setState(data);
  },
  getState(): State {
    return state;
  },
  setState(patch: Partial<State>): void {
    state = { ...state, ...patch };
  },
  mutate(fn: (state: State) => void): void {
    fn(state);
    this.setState(state);
    emitChange();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(() => listener());
    return () => {
      listeners.delete(listener);
    };
  },
  setLocale(lang: LANG) {
    this.mutate((prev) => {
      prev.lang = lang;
    });
  },
  setActiveTab(tabId: TabId) {
    this.mutate((prev) => {
      prev.activeTab = tabId;
      if (tabId !== 'addRecipe') {
        prev.editingRecipeId = null;
      }
    });
    onActiveTabChange(tabId);
  },
  setFridgeEntry(
    ingredientId: string,
    entry: { inStock: boolean; amount: number | null; unit: string | null }
  ) {
    this.mutate((prev) => {
      prev.fridge[ingredientId] = entry;
    });
  },
  getFridgeEntry(ingredientId: string) {
    return (
      state.fridge[ingredientId] || { inStock: false, amount: null, unit: null }
    );
  },
  removeFridgeEntry(ingredientId: string) {
    const { [ingredientId]: _, ...rest } = state.fridge;
    this.mutate((prev) => {
      prev.fridge = rest;
    });
  },
  addIngredient(ingredient: { id: string; name: string }) {
    this.mutate((prev) => {
      prev.ingredients.push(ingredient);
    });
  },
  setIngredients(ingredients: { id: string; name: string }[]) {
    this.mutate((prev) => {
      prev.ingredients = ingredients;
    });
  },
  setEditingRecipeId(recipeId: string | null) {
    this.mutate((prev) => {
      prev.editingRecipeId = recipeId;
    });
  },
  setRecipes(recipes: State['recipes']) {
    this.mutate((prev) => {
      prev.recipes = recipes;
    });
  },
};

function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}

window.__appState = stateStore.getState;
