import { renderInitialMarkup } from './initial-markup';
import { loadData } from './database';
import { bindIOEvents, render } from './render';

/* ============================= INIT ============================= */
async function init(rootEl: HTMLElement) {
  renderInitialMarkup(rootEl);

  const viewEl = rootEl.querySelector('#view') as HTMLElement;

  if (!viewEl) {
    throw new Error('Not found #view element in rootEl');
  }

  window.state.viewEl = viewEl;

  if (!window.indexedDB) {
    window.state.viewEl.innerHTML = `<div class="empty-state"><div class="display">IndexedDB недоступен</div><p>Этот браузер не поддерживает IndexedDB, приложение не сможет сохранять данные.</p></div>`;
    return;
  }
  window.state.viewEl.innerHTML = `<div class="empty-state"><div class="display">Загрузка…</div></div>`;
  try {
    const data = await loadData();
    window.state.ingredients = data.ingredients;
    window.state.fridge = data.fridge;
    window.state.recipes = data.recipes;
  } catch (e) {
    console.error(e);
    window.state.ingredients = [];
    window.state.fridge = {};
    window.state.recipes = [];
  }
  bindIOEvents();
  render();
}

export default init;
