import { renderInitialMarkup } from './initial-markup';
import { loadData } from './database';
import { render, renderRootElement, rerenderViewElement } from './render';
import { t } from './lang/index';
import { LANG_EN_US } from './lang/en_US';
import { el } from './utils';
import { defaultState } from './state';

/* ============================= INIT ============================= */
async function init(rootEl: HTMLElement) {
  if (!window.indexedDB) {
    const emptyStateEl = el('div', { className: 'empty-state' }, [
      el('div', { className: 'display' }, LANG_EN_US.indexedDB.unavailable),
      el('p', {}, LANG_EN_US.indexedDB.unsupported),
    ]);
    renderRootElement(rootEl, emptyStateEl);
    return;
  }

  renderRootElement(
    rootEl,
    el('div', { className: 'empty-state' }, [
      el('div', { className: 'display' }, t('loading')),
    ])
  );

  try {
    const data = await loadData();
    Object.assign(window.state, data);
  } catch (e) {
    const err = e as Error;
    console.error(err);
    alert(err.message);
    Object.assign(window.state, defaultState);
  }

  renderInitialMarkup(rootEl);

  const viewEl = rootEl.querySelector('#view') as HTMLElement;

  if (!viewEl) {
    throw new Error('Not found #view element in rootEl');
  }

  window.state.viewEl = viewEl;

  render();
}

export default init;
