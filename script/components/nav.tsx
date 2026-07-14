import React from 'react';
import { t } from '../lang/lang.ts';
import { TABS } from './tabs/tabs.ts';
import { useAppState } from '../hooks/use-app-state.ts';
import { stateStore } from '../store/store.ts';

export const Navigation = () => {
  const state = useAppState();

  return (
    <nav className='tabs'>
      {TABS.map((tab) => (
        <button
          key={tab}
          data-tab={tab}
          className={state.activeTab === tab ? 'active' : ''}
          onClick={() => stateStore.setActiveTab(tab)}
        >
          {t(`nav.${tab}`)}
        </button>
      ))}
    </nav>
  );
};
