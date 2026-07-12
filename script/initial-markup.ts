import { TabId } from './state';
import { el } from './utils';

export function buildInitialMarkup(rootEl: HTMLElement) {
  const app = rootEl;

  // ---- Header ----
  const titleBlock = el('div', {}, [
    el('h1', { text: 'Что приготовить' }),
    el('div', {
      className: 'tagline',
      text: 'подбор рецептов по тому, что есть в холодильнике',
    }),
  ]);

  const kebabBtn = el('button', {
    className: 'kebab-btn',
    id: 'kebabBtn',
    title: 'Меню',
    'aria-haspopup': 'true',
    'aria-expanded': 'false',
    text: '⋮',
  });
  const dropdownMenu = el(
    'div',
    { className: 'dropdown-menu', id: 'dropdownMenu', hidden: true },
    [el('button', { id: 'openIOModalBtn', text: 'Экспорт / импорт рецептов' })]
  );
  const menuWrap = el('div', { className: 'menu-wrap' }, [
    kebabBtn,
    dropdownMenu,
  ]);

  const header = el('header', { className: 'top' }, [titleBlock, menuWrap]);

  // ---- Export / import modal ----
  const modalHead = el('div', { className: 'modal-head' }, [
    el('h3', { id: 'ioModalTitle', text: 'Экспорт / импорт рецептов' }),
    el('button', {
      className: 'modal-close',
      id: 'ioModalClose',
      'aria-label': 'Закрыть',
      text: '✕',
    }),
  ]);

  const exportBlock = el('div', { className: 'io-block' }, [
    el('h4', { text: 'Экспорт' }),
    el('p', {
      text: 'Скачать все рецепты в один JSON-файл — для бэкапа или переноса на другое устройство.',
    }),
    el('button', {
      className: 'btn',
      id: 'exportBtn',
      text: 'Скачать рецепты',
    }),
  ]);

  const importFileInput = el('input', {
    type: 'file',
    id: 'importFile',
    accept: 'application/json',
  });
  importFileInput.style.display = 'none';
  const importBlock = el('div', { className: 'io-block' }, [
    el('h4', { text: 'Импорт' }),
    el('p', {
      text: 'Загрузить JSON-файл, экспортированный этим же приложением. Рецепты с совпадающим названием будут обновлены, остальные — добавлены.',
    }),
    el('button', {
      className: 'btn secondary',
      id: 'importBtn',
      text: 'Выбрать файл…',
    }),
    importFileInput,
  ]);

  const modalBody = el('div', { className: 'modal-body' }, [
    exportBlock,
    importBlock,
  ]);
  const modalCard = el(
    'div',
    {
      className: 'modal-card',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'ioModalTitle',
    },
    [modalHead, modalBody]
  );
  const modalOverlay = el(
    'div',
    { className: 'modal-overlay', id: 'ioModalOverlay', hidden: true },
    [modalCard]
  );

  // ---- Tabs ----
  const nav = el('nav', { className: 'tabs' }, [
    el('button', {
      'data-tab': 'recipes',
      className: 'active',
      text: 'Рецепты',
    }),
    el('button', { 'data-tab': 'fridge', text: 'Мои продукты' }),
    el('button', { 'data-tab': 'add', text: 'Добавить рецепт' }),
  ]);

  // ---- View root ----
  const main = el('main', { id: 'view' });

  app.append(header, modalOverlay, nav, main);
}

export function bindInitialMarkupEvents() {
  document.querySelectorAll('nav.tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      window.state.activeTab = (btn as HTMLButtonElement).dataset.tab as TabId;
      if (window.state.activeTab !== 'add') window.state.editingRecipeId = null;
      document
        .querySelectorAll('nav.tabs button')
        .forEach((b) => b.classList.toggle('active', b === btn));
      window.render();
    });
  });
}

export function renderInitialMarkup(rootEl: HTMLElement) {
  buildInitialMarkup(rootEl);
  bindInitialMarkupEvents();
}
