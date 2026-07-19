import React from 'react';
import { FaEllipsisVertical } from 'react-icons/fa6';
import { LANG_FLAGS, LANG_LABELS, t } from '../lang/lang.ts';
import { useAppState } from '../hooks/use-app-state.ts';

export interface HeaderProps {
  isMenuOpen: boolean;
  onKebabClick: () => void;
  onExportModalOpen: () => void;
  onSettingsModalOpen: () => void;
  onLangChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Header = ({
  isMenuOpen,
  onKebabClick,
  onExportModalOpen,
  onSettingsModalOpen,
  onLangChange,
}: HeaderProps) => {
  const state = useAppState();

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
              selected={state.lang === lang}
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
          <FaEllipsisVertical color='inherit' />
        </button>
        <div className='dropdown-menu' id='dropdownMenu' hidden={!isMenuOpen}>
          <button id='openIOModalBtn' onClick={onExportModalOpen}>
            {t('exportImport.openModalBtn')}
          </button>
          <button id='openSettingsModalBtn' onClick={onSettingsModalOpen}>
            {t('settings.openMenuBtn')}
          </button>
        </div>
      </div>
    </header>
  );
};
