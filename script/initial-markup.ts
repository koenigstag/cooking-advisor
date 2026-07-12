import { saveData } from './database';
import { exportRecipes, importRecipesFromPayload } from './export-import';
import { LANG_FLAGS, LANG_LABELS, t } from './lang/index';
import { renderRootElement } from './render';
import { TabId } from './state';
import { setActiveTab } from './tabs/index';
import { el } from './utils';

function renderRootMarkup(rootEl: HTMLElement) {
  // ---- Header ----
  const titleBlock = el('div', {}, [
    el('h1', { text: t('root.title') }),
    el('div', {
      className: 'tagline',
      text: t('root.tagline'),
    }),
  ]);

  const langSelector = el(
    'select',
    {
      id: 'langSelector',
      style: {
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '1rem',
        padding: '0.1rem 0.2rem',
      },
    },
    [
      ...Object.entries(LANG_LABELS).map(([lang, label]) =>
        el('option', {
          value: lang,
          title: label,
          selected: window.state.lang === lang,
          text: LANG_FLAGS[lang as keyof typeof LANG_FLAGS],
        })
      ),
    ]
  );

  langSelector.addEventListener('change', (e) => {
    const selectedLang = (e.target as HTMLSelectElement)
      .value as keyof typeof LANG_LABELS;
    window.state.lang = selectedLang;
    saveData().then(() => {
      window.location.reload();
    });
  });

  const kebabBtn = el('button', {
    className: 'kebab-btn',
    id: 'kebabBtn',
    title: t('common.menu'),
    'aria-haspopup': 'true',
    'aria-expanded': 'false',
    text: '⋮',
  });
  const dropdownMenu = el(
    'div',
    { className: 'dropdown-menu', id: 'dropdownMenu', hidden: true },
    [
      el('button', {
        id: 'openIOModalBtn',
        text: t('exportImport.openModalBtn'),
      }),
    ]
  );
  const menuWrap = el(
    'div',
    {
      className: 'menu-wrap',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      },
    },
    [langSelector, kebabBtn, dropdownMenu]
  );

  const header = el('header', { className: 'top' }, [titleBlock, menuWrap]);

  // ---- Export / import modal ----
  const modalHead = el('div', { className: 'modal-head' }, [
    el('h3', { id: 'ioModalTitle', text: t('exportImport.modalTitle') }),
    el('button', {
      className: 'modal-close',
      id: 'ioModalClose',
      'aria-label': t('common.close'),
      text: '✕',
    }),
  ]);

  const exportBlock = el('div', { className: 'io-block' }, [
    el('h4', { text: t('exportImport.export.title') }),
    el('p', {
      text: t('exportImport.export.description'),
    }),
    el('button', {
      className: 'btn',
      id: 'exportBtn',
      text: t('exportImport.export.downloadBtn'),
    }),
  ]);

  const importFileInput = el('input', {
    type: 'file',
    id: 'importFile',
    accept: 'application/json',
  });
  importFileInput.style.display = 'none';
  const importBlock = el('div', { className: 'io-block' }, [
    el('h4', { text: t('exportImport.import.title') }),
    el('p', {
      text: t('exportImport.import.description'),
    }),
    el('button', {
      className: 'btn secondary',
      id: 'importBtn',
      text: t('exportImport.import.uploadBtn'),
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
      className: window.state.activeTab === 'recipes' ? 'active' : '',
      text: t('nav.recipes'),
    }),
    el('button', {
      'data-tab': 'fridge',
      className: window.state.activeTab === 'fridge' ? 'active' : '',
      text: t('nav.fridge'),
    }),
    el('button', {
      'data-tab': 'addRecipe',
      className: window.state.activeTab === 'addRecipe' ? 'active' : '',
      text: t('nav.addRecipe'),
    }),
  ]);

  // ---- View root ----
  const main = el('main', { id: 'view' });

  renderRootElement(rootEl, header, modalOverlay, nav, main);
}

function bindInitialMarkupEvents() {
  document.querySelectorAll('nav.tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveTab((btn as HTMLButtonElement).dataset.tab as TabId);
    });
  });

  const kebabBtn = document.getElementById('kebabBtn') as HTMLButtonElement;
  const dropdownMenu = document.getElementById(
    'dropdownMenu'
  ) as HTMLDivElement;
  const openIOModalBtn = document.getElementById(
    'openIOModalBtn'
  ) as HTMLButtonElement;
  const ioModalOverlay = document.getElementById(
    'ioModalOverlay'
  ) as HTMLDivElement;
  const ioModalClose = document.getElementById(
    'ioModalClose'
  ) as HTMLButtonElement;

  function closeDropdown() {
    dropdownMenu.hidden = true;
    kebabBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleDropdown() {
    const willOpen = dropdownMenu.hidden;
    dropdownMenu.hidden = !willOpen;
    kebabBtn.setAttribute('aria-expanded', String(willOpen));
  }
  kebabBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });
  document.addEventListener('click', (e) => {
    if (
      e.target &&
      !dropdownMenu.hidden &&
      !dropdownMenu.contains(e.target as any) &&
      e.target !== kebabBtn
    ) {
      closeDropdown();
    }
  });

  function openModal() {
    closeDropdown();
    ioModalOverlay.hidden = false;
  }
  function closeModal() {
    ioModalOverlay.hidden = true;
  }
  openIOModalBtn.addEventListener('click', openModal);
  ioModalClose.addEventListener('click', closeModal);
  ioModalOverlay.addEventListener('click', (e) => {
    if (e.target === ioModalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeDropdown();
    }
  });

  document.getElementById('exportBtn')?.addEventListener('click', async () => {
    const result = await exportRecipes();
    if (!result.success) {
      alert(result.message || t('exportImport.export.defaultError'));
      return;
    }

    result.click?.();
  });
  const importBtn = document.getElementById('importBtn') as HTMLButtonElement;
  const importFile = document.getElementById('importFile') as HTMLInputElement;

  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    const file = importFile.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const payload = JSON.parse(reader.result as string);
        const result = await importRecipesFromPayload(payload);
        if (!result.success) {
          alert(result.message || t('exportImport.import.defaultError'));
          return;
        }
        window.render();
        alert(
          t('exportImport.import.successMessage', {
            added: result.added,
            replaced: result.replaced,
            skipped: result.skipped,
          })
        );
        closeModal();
      } catch (e) {
        alert(t('exportImport.import.invalidFileFormat'));
        console.error(e);
      }
      importFile.value = '';
    };
    reader.readAsText(file);
  });
}

export function renderInitialMarkup(rootEl: HTMLElement) {
  renderRootMarkup(rootEl);
  bindInitialMarkupEvents();
}
