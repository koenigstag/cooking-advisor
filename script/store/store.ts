import {
  defaultState,
  type Ingredient,
  type IngredientTag,
  type State,
} from './state.ts';
import { onActiveTabChange, type TabId } from '../components/tabs/tabs.ts';
import type { LANG } from '../lang/lang.ts';
import { loadData } from '../database/index.ts';

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
  addIngredient(ingredient: Ingredient) {
    this.mutate((prev) => {
      prev.ingredients.push(ingredient);
    });
  },
  setIngredients(ingredients: Ingredient[]) {
    this.mutate((prev) => {
      prev.ingredients = ingredients;
    });
  },
  setIngredientCalories(ingredientId: string, calories: number | null) {
    this.mutate((prev) => {
      const ingredient = prev.ingredients.find((i) => i.id === ingredientId);
      if (!ingredient) return;
      if (calories == null) delete ingredient.calories;
      else ingredient.calories = calories;
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
  setServerBaseUrl(url: string) {
    this.mutate((prev) => {
      prev.serverBaseUrl = url;
    });
  },
  setDietaryAction(action: State['dietary']['action']) {
    this.mutate((prev) => {
      prev.dietary.action = action;
    });
  },
  addToDietaryBlocklist(ingredientIds: string[]) {
    this.mutate((prev) => {
      const set = new Set(prev.dietary.blocklist);
      ingredientIds.forEach((id) => set.add(id));
      prev.dietary.blocklist = [...set];
    });
  },
  removeFromDietaryBlocklist(ingredientId: string) {
    this.mutate((prev) => {
      prev.dietary.blocklist = prev.dietary.blocklist.filter(
        (id) => id !== ingredientId
      );
    });
  },
  addDietaryBlockedTags(tags: IngredientTag[]) {
    this.mutate((prev) => {
      const set = new Set(prev.dietary.blockedTags);
      tags.forEach((tag) => set.add(tag));
      prev.dietary.blockedTags = [...set];
    });
  },
  toggleDietaryBlockedTag(tag: IngredientTag) {
    this.mutate((prev) => {
      const set = new Set(prev.dietary.blockedTags);
      if (set.has(tag)) set.delete(tag);
      else set.add(tag);
      prev.dietary.blockedTags = [...set];
    });
  },
};

function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}

window.__appState = stateStore.getState;

(window as any).__clearAppState = () => {
  state = { ...defaultState };
  emitChange();
};
