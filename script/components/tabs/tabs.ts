export type TabId = 'recipes' | 'fridge' | 'addRecipe';

export const TABS = ['recipes', 'fridge', 'addRecipe'] as const;

export function onActiveTabChange(tabId: TabId) {
  const newParams = new URLSearchParams(window.location.search);
  newParams.set('tab', tabId);
  window.history.pushState({}, '', `${window.location.pathname}?${newParams}`);
}
