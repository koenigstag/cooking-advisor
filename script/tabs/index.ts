import { TabId } from '../state';

export function setActiveTab(tabId: TabId) {
  window.state.activeTab = tabId;

  if (window.state.activeTab !== 'addRecipe')
    window.state.editingRecipeId = null;

  document
    .querySelectorAll('nav.tabs button')
    .forEach((b) =>
      b.classList.toggle('active', (b as HTMLElement).dataset.tab === tabId)
    );

  const newParams = new URLSearchParams(window.location.search);
  newParams.set('tab', tabId);
  window.history.pushState({}, '', `${window.location.pathname}?${newParams}`);

  window.render();
}
