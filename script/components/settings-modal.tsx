import React from 'react';
import { FaXmark } from 'react-icons/fa6';
import { t } from '../lang/lang.ts';
import { saveData } from '../database.ts';
import { stateStore } from '../store/store.ts';
import { useAppState } from '../hooks/use-app-state.ts';
import { validateServerBaseUrl } from '../validate-server-url.ts';

export interface SettingsModalProps {
  open: boolean;
  onClose?: () => void;
}

type SettingsTab = 'dietary' | 'sync';

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const state = useAppState();
  const [tab, setTab] = React.useState<SettingsTab>('dietary');
  const [baseUrlInput, setBaseUrlInput] = React.useState(state.serverBaseUrl);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setBaseUrlInput(state.serverBaseUrl);
    setError(null);
    setSaved(false);
  }, [open]);

  const handleBaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseUrlInput(e.target.value);
    setError(null);
    setSaved(false);
  };

  const handleSaveSync = async () => {
    const result = validateServerBaseUrl(baseUrlInput, window.location.protocol);
    if (!result.ok) {
      setError(t(`settings.sync.errors.${result.error}`));
      return;
    }

    setError(null);
    stateStore.setServerBaseUrl(result.origin);
    await saveData();
    setSaved(true);
  };

  return (
    <div className='modal-overlay' hidden={!open} onClick={onClose}>
      <div
        className='modal-card settings-modal-card'
        role='dialog'
        aria-modal='true'
        aria-labelledby='settingsModalTitle'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='modal-head'>
          <h3 id='settingsModalTitle'>{t('settings.title')}</h3>
          <button
            className='modal-close'
            aria-label={t('common.close')}
            onClick={onClose}
          >
            <FaXmark />
          </button>
        </div>
        <div className='modal-body'>
          <nav className='tabs settings-tabs'>
            <button
              className={tab === 'dietary' ? 'active' : ''}
              onClick={() => setTab('dietary')}
            >
              {t('settings.tabs.dietary')}
            </button>
            <button
              className={tab === 'sync' ? 'active' : ''}
              onClick={() => setTab('sync')}
            >
              {t('settings.tabs.sync')}
            </button>
          </nav>

          {tab === 'dietary' && (
            <div className='settings-panel'>
              <p className='empty-hint'>{t('settings.dietary.comingSoon')}</p>
            </div>
          )}

          {tab === 'sync' && (
            <div className='settings-panel'>
              <div className='field'>
                <label>{t('settings.sync.serverBaseUrl.label')}</label>
                <input
                  type='text'
                  value={baseUrlInput}
                  placeholder={t('settings.sync.serverBaseUrl.placeholder')}
                  onChange={handleBaseUrlChange}
                />
              </div>
              {error && <p className='field-error'>{error}</p>}
              {saved && !error && (
                <p className='field-success'>{t('settings.sync.saved')}</p>
              )}
              <button className='btn' onClick={handleSaveSync}>
                {t('common.save')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
