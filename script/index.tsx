import React from 'react';
import ReactDOM from 'react-dom/client';
import { IndexedDBUnsupported } from './components/index-db-unsupported.tsx';
import { LoadingState } from './components/loading.tsx';
import { App } from './components/app.tsx';
import { stateStore } from './store/store.ts';

async function init(root: HTMLElement) {
  const reactRoot = ReactDOM.createRoot(root);

  if (
    typeof window === 'undefined' ||
    typeof window.indexedDB === 'undefined'
  ) {
    reactRoot.render(<IndexedDBUnsupported />);
    return;
  }

  try {
    reactRoot.render(<LoadingState />);

    await stateStore.initialize();
    console.debug('stateStore initialized', stateStore);
  } catch (e) {
    console.error(e);
    alert((e as Error).message);
  }

  reactRoot.render(<App />);
}

export default init;
