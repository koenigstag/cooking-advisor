import React from 'react';
import ReactDOM from 'react-dom/client';
import { IndexedDBUnsupported } from './components/index-db-unsupported.tsx';
import { LoadingState } from './components/loading.tsx';
import { AppError } from './components/app-error.tsx';
import { ErrorBoundary } from './components/error-boundary.tsx';
import { SnackbarProvider } from './components/snackbar.tsx';
import { ConfirmProvider } from './components/confirm-dialog.tsx';
import { App } from './components/app.tsx';
import { stateStore } from './store/store.ts';
import { syncIngredientCatalog } from './ingredient-catalog.ts';
import { migrate } from './database/index.ts';

async function init(root: HTMLElement) {
  const reactRoot = ReactDOM.createRoot(root);

  if (
    typeof window === 'undefined' ||
    typeof window.indexedDB === 'undefined'
  ) {
    reactRoot.render(<IndexedDBUnsupported />);
    return;
  }

  reactRoot.render(<LoadingState />);

  // Fatal: if the local data can't be read/migrated safely, don't let the
  // app start on top of it — render an error state instead.
  try {
    await migrate();
    await stateStore.initialize();
    console.debug('stateStore initialized', stateStore);
  } catch (e) {
    console.error(e);
    reactRoot.render(<AppError error={e} />);
    return;
  }

  // Non-fatal: the ingredient catalog sync already no-ops gracefully when
  // the server is unreachable, but guard it anyway — a bad connection here
  // shouldn't keep the app itself from starting.
  try {
    await syncIngredientCatalog();
  } catch (e) {
    console.warn('Ingredient catalog sync failed, continuing without it', e);
  }

  reactRoot.render(
    <SnackbarProvider>
      <ConfirmProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ConfirmProvider>
    </SnackbarProvider>
  );
}

export default init;
