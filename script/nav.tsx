import React from 'react';
import { t } from './lang/index';
import { TABS } from './tabs/index';

export const Navigation = () => {
  return (
    <nav className='tabs'>
      {TABS.map((tab) => (
        <button
          key={tab}
          data-tab={tab}
          className={window.state.activeTab === tab ? 'active' : ''}
        >
          {t(`nav.${tab}`)}
        </button>
      ))}
    </nav>
  );
};
