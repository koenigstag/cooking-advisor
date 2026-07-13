import { loadData } from './database';
import { t } from './lang/index';
import { LANG_EN_US } from './lang/en_US';
import { defaultState } from './store/state';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { App } from './app';
import { stateStore } from './store/store';

/* ============================= INIT ============================= */

function IndexedDBUnavailable() {
  return (
    <div className='empty-state'>
      <div className='display'>{LANG_EN_US.indexedDB.unavailable}</div>
      <p>{LANG_EN_US.indexedDB.unsupported}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className='empty-state'>
      <div className='display'>{t('loading')}</div>
    </div>
  );
}

async function init(root: HTMLElement) {
  const reactRoot = createRoot(root);

  if (!window.indexedDB) {
    reactRoot.render(<IndexedDBUnavailable />);
    return;
  }

  try {
    reactRoot.render(<LoadingState />);

    const data = await loadData();
    stateStore.initialize(data);
  } catch (e) {
    const err = e as Error;
    console.error(err);
    alert(err.message);
    stateStore.initialize(defaultState);
  }

  reactRoot.render(<App />);
}

export default init;
