export type TabId = 'recipes' | 'fridge' | 'addRecipe';

export const TABS = ['recipes', 'fridge', 'addRecipe'] as const;

export function onActiveTabChange(tabId: TabId) {
  document
    .querySelectorAll('nav.tabs button')
    .forEach((b) =>
      b.classList.toggle('active', (b as HTMLElement).dataset.tab === tabId)
    );

  const newParams = new URLSearchParams(window.location.search);
  newParams.set('tab', tabId);
  window.history.pushState({}, '', `${window.location.pathname}?${newParams}`);
}
