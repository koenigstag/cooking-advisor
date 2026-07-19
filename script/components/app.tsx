import React from 'react';
import { LANG_LABELS, t } from '../lang/lang.ts';
import { saveData } from '../database/index.ts';
import { Modal } from './modal.tsx';
import { SettingsModal } from './settings-modal.tsx';
import { Header } from './header.tsx';
import { Navigation } from './nav.tsx';
import { ErrorBoundary } from './error-boundary.tsx';
import { useAppState } from '../hooks/use-app-state.ts';
import { stateStore } from '../store/store.ts';
import { RecipesTab } from './tabs/recipes.tsx';
import { FridgeTab } from './tabs/fridge.tsx';
import { AddRecipeTab } from './tabs/create-recipe.tsx';
import { TABS, type TabId } from './tabs/tabs.ts';

const tabIdFromUrl = ((): TabId => {
  const tabParam = new URLSearchParams(window.location.search).get(
    'tab'
  ) as TabId;
  return TABS.includes(tabParam) ? tabParam : 'recipes';
})();

export const App = () => {
  const state = useAppState();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);

  const handleKebabOpen = () => {
    setIsMenuOpen(s => !s);
  };

  const handleKebabClose = () => {
    setIsMenuOpen(false);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
    handleKebabClose();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSettingsModalOpen = () => {
    setIsSettingsModalOpen(true);
    handleKebabClose();
  };

  const handleSettingsModalClose = () => {
    setIsSettingsModalOpen(false);
  };

  const handleLangChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value as keyof typeof LANG_LABELS;
    stateStore.setLocale(selectedLang);
    await saveData();
  };

  React.useEffect(() => {
    window.document.title = t('title');

    if (tabIdFromUrl && state.activeTab !== tabIdFromUrl) {
      stateStore.setActiveTab(tabIdFromUrl);
    }
  }, []);

  return (
    <React.Fragment>
      <Header
        isMenuOpen={isMenuOpen}
        onKebabClick={handleKebabOpen}
        onExportModalOpen={handleModalOpen}
        onSettingsModalOpen={handleSettingsModalOpen}
        onLangChange={handleLangChange}
      />
      <Modal open={isModalOpen} onClose={handleModalClose} />
      <SettingsModal
        open={isSettingsModalOpen}
        onClose={handleSettingsModalClose}
      />
      <Navigation />
      <main id='view'>
        {state.activeTab === 'recipes' && (
          <ErrorBoundary title={t('tabError.title')} hint={t('tabError.hint')}>
            <RecipesTab />
          </ErrorBoundary>
        )}
        {state.activeTab === 'fridge' && (
          <ErrorBoundary title={t('tabError.title')} hint={t('tabError.hint')}>
            <FridgeTab />
          </ErrorBoundary>
        )}
        {state.activeTab === 'addRecipe' && (
          <ErrorBoundary title={t('tabError.title')} hint={t('tabError.hint')}>
            <AddRecipeTab />
          </ErrorBoundary>
        )}
      </main>
    </React.Fragment>
  );
};
