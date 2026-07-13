import React from 'react';
import { LANG_FLAGS, LANG_LABELS, t } from './lang';

export interface HeaderProps {
  isMenuOpen: boolean;
  onKebabClick: () => void;
  onExportModalOpen: () => void;
  onLangChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Header = ({
  isMenuOpen,
  onKebabClick,
  onExportModalOpen,
  onLangChange,
}: HeaderProps) => {
  return (
    <header className='top'>
      <div className='title-block'>
        <h1>{t('root.title')}</h1>
        <div className='tagline'>{t('root.tagline')}</div>
      </div>
      <div
        className='menu-wrap'
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <select
          name='lang'
          id='langSelector'
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem',
            padding: '0.1rem 0.2rem',
          }}
          onChange={onLangChange}
        >
          {Object.entries(LANG_LABELS).map(([lang, label]) => (
            <option
              key={lang}
              value={lang}
              title={label}
              selected={window.state.lang === lang}
            >
              {LANG_FLAGS[lang as keyof typeof LANG_FLAGS]}
            </option>
          ))}
        </select>
        <button
          id='kebabBtn'
          className='kebab-btn'
          title={t('common.menu')}
          aria-haspopup='true'
          aria-expanded={isMenuOpen}
          onClick={onKebabClick}
        >
          ⋮
        </button>
        <div className='dropdown-menu' id='dropdownMenu' hidden={!isMenuOpen}>
          <button id='openIOModalBtn' onClick={onExportModalOpen}>
            {t('exportImport.openModalBtn')}
          </button>
        </div>
      </div>
    </header>
  );
};
