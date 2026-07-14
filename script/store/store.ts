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
    state = { ...state, ...data };
  },
  getState(): State {
    return state;
  },
  setState(patch: Partial<State>): void {
    state = { ...state, ...patch };
    emitChange();
  },
  mutate(fn: (state: State) => void): void {
    fn(state);
    emitChange();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  setLocale(lang: LANG) {
    state.lang = lang;
    emitChange();
  },
  setActiveTab(tabId: TabId) {
    state.activeTab = tabId;
    if (state.activeTab !== 'addRecipe') state.editingRecipeId = null;
    onActiveTabChange(tabId);
    emitChange();
  },
  setFridgeEntry(
    ingredientId: string,
    entry: { inStock: boolean; amount: number | null; unit: string | null }
  ) {
    state.fridge[ingredientId] = entry;
    emitChange();
  },
  getFridgeEntry(ingredientId: string) {
    return (
      state.fridge[ingredientId] || { inStock: false, amount: null, unit: null }
    );
  },
  removeFridgeEntry(ingredientId: string) {
    delete state.fridge[ingredientId];
    emitChange();
  },
  addIngredient(ingredient: { id: string; name: string }) {
    state.ingredients.push(ingredient);
    emitChange();
  },
  setIngredients(ingredients: { id: string; name: string }[]) {
    state.ingredients = ingredients;
    emitChange();
  },
  setEditingRecipeId(recipeId: string | null) {
    state.editingRecipeId = recipeId;
    emitChange();
  },
  setRecipes(recipes: State['recipes']) {
    state.recipes = recipes;
    emitChange();
  },
};

function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}

(window as any).__appState = stateStore.getState;
