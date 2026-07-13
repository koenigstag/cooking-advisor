import { t } from './lang';
import { renderAddTab } from './tabs/create-recipe';
import { renderFridgeTab } from './tabs/fridge';
import { renderRecipesTab } from './tabs/recipes';

export function renderRootElement(
  rootEl: HTMLElement,
  ...children: HTMLElement[]
) {
  rootEl.innerHTML = '';
  rootEl.append(...children);
}

export function rerenderViewElement(...children: HTMLElement[]) {
  window.state.viewEl.innerHTML = '';
  window.state.viewEl.append(...children);
}

export function render() {
  window.document.title = t('title');

  if (window.state.activeTab === 'recipes') renderRecipesTab();
  else if (window.state.activeTab === 'fridge') renderFridgeTab();
  else if (window.state.activeTab === 'addRecipe') renderAddTab();
}

window.render = render;
