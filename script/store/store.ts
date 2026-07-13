import { defaultState, type State } from './state';
import { onActiveTabChange, type TabId, TABS } from '../tabs/index';
import type { LANG } from '../lang';

const tabIdFromUrl = ((): TabId => {
  const tabParam = new URLSearchParams(window.location.search).get(
    'tab'
  ) as TabId;
  return TABS.includes(tabParam) ? tabParam : 'recipes';
})();

let state: State = {
  ...defaultState,

  activeTab: tabIdFromUrl,
  editingRecipeId: null,
};
type Listener = () => void;
const listeners = new Set<Listener>();

export const stateStore = {
  getState(): State {
    return state;
  },
  initialize(initialState: Partial<State>) {
    state = { ...state, ...initialState };
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
