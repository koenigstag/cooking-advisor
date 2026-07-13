import React from 'react';
import { LANG_LABELS, t } from './lang';
import { saveData } from './database';
import { Modal } from './modal';
import { Header } from './header';
import { Navigation } from './nav';
import { useAppState } from './hooks/use-app-state';
import { stateStore } from './store/store';
import { RecipesTab } from './tabs/recipes';
import { FridgeTab } from './tabs/fridge';
import { AddRecipeTab } from './tabs/create-recipe';

export const App = () => {
  const state = useAppState();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleKebabOpen = () => {
    setIsMenuOpen(true);
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

  const handleLangChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value as keyof typeof LANG_LABELS;
    stateStore.setLocale(selectedLang);
    await saveData();
  };

  React.useEffect(() => {
    window.document.title = t('title');
  }, []);

  return (
    <React.Fragment>
      <Header
        isMenuOpen={isMenuOpen}
        onKebabClick={handleKebabOpen}
        onExportModalOpen={handleModalOpen}
        onLangChange={handleLangChange}
      />
      <Modal open={isModalOpen} onClose={handleModalClose} />
      <Navigation />
      <main id='view'>
        {state.activeTab === 'recipes' && <RecipesTab />}
        {state.activeTab === 'fridge' && <FridgeTab />}
        {state.activeTab === 'addRecipe' && <AddRecipeTab />}
      </main>
    </React.Fragment>
  );
};
