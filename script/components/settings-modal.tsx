import React from 'react';
import { FaXmark } from 'react-icons/fa6';
import { t } from '../lang/lang.ts';
import { saveData } from '../database.ts';
import { stateStore } from '../store/store.ts';
import { useAppState } from '../hooks/use-app-state.ts';
import { validateServerBaseUrl } from '../validate-server-url.ts';
import { findIngredientByName, ingredientDisplayName } from '../ingredient.ts';
import { DIETARY_PRESETS, isPresetActive } from '../dietary-presets.ts';
import { INGREDIENT_TAGS } from '../store/state.ts';

export interface SettingsModalProps {
  open: boolean;
  onClose?: () => void;
}

type SettingsTab = 'dietary' | 'sync';

const DietaryTab = () => {
  const state = useAppState();
  const [query, setQuery] = React.useState('');
  const [addError, setAddError] = React.useState<string | null>(null);
  const [addingIngredient, setAddingIngredient] = React.useState(false);
  const [addingTag, setAddingTag] = React.useState(false);

  const blocklistIngredients = state.dietary.blocklist
    .map((id) => state.ingredients.find((i) => i.id === id))
    .filter((i): i is NonNullable<typeof i> => !!i)
    .sort((a, b) =>
      ingredientDisplayName(a.name, state.lang).localeCompare(
        ingredientDisplayName(b.name, state.lang)
      )
    );

  const handleAdd = () => {
    const name = query.trim();
    if (!name) return;
    const ing = findIngredientByName(name);
    if (!ing) {
      setAddError(t('settings.dietary.blocklist.unknownIngredient'));
      return;
    }
    setAddError(null);
    stateStore.addToDietaryBlocklist([ing.id]);
    saveData();
    setQuery('');
  };

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (id: string) => {
    stateStore.removeFromDietaryBlocklist(id);
    saveData();
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    stateStore.setDietaryAction(e.target.value as 'warn' | 'hide');
    saveData();
  };

  const handlePresetClick = (presetId: (typeof DIETARY_PRESETS)[number]['id']) => {
    const preset = DIETARY_PRESETS.find((p) => p.id === presetId)!;
    const tagList = preset.blockTags.map((tag) => t(`ingredientTags.${tag}`)).join(', ');
    if (!confirm(t('settings.dietary.presets.confirmApply', { list: tagList }))) return;
    stateStore.addDietaryBlockedTags(preset.blockTags);
    saveData();
  };

  const handleRemoveTag = (tag: (typeof INGREDIENT_TAGS)[number]) => {
    stateStore.toggleDietaryBlockedTag(tag);
    saveData();
  };

  const handleTagSuggestionClick = () => {
    stateStore.addDietaryBlockedTags(['shellfish']);
    saveData();
  };

  const handleIngredientSuggestionClick = () => {
    setAddingIngredient(true);
    setQuery(t('ingredientTags.peanut'));
    setAddError(null);
  };

  const visiblePresets = DIETARY_PRESETS.filter(
    (preset) => !isPresetActive(preset, state.dietary.blockedTags)
  );

  return (
    <div className='settings-panel'>
      <div className='field'>
        <label>{t('settings.dietary.action.label')}</label>
        <select
          id='dietaryActionSelect'
          value={state.dietary.action}
          onChange={handleActionChange}
        >
          <option value='warn'>{t('settings.dietary.action.warn')}</option>
          <option value='hide'>{t('settings.dietary.action.hide')}</option>
        </select>
      </div>

      <div className='dietary-heading'>{t('settings.dietary.blocklistHeading')}</div>

      {visiblePresets.length > 0 && (
        <div className='field'>
          <div className='dietary-subheading'>{t('settings.dietary.presets.label')}</div>
          <div className='dietary-presets'>
            {visiblePresets.map((preset) => (
              <button
                key={preset.id}
                className='btn ghost'
                onClick={() => handlePresetClick(preset.id)}
              >
                {t(`settings.dietary.presets.${preset.id}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className='field'>
        <div className='dietary-subheading'>{t('settings.dietary.blockByTag.label')}</div>
        <p className='dietary-caption'>{t('settings.dietary.blockByTag.caption')}</p>
        <div className='pill-row' id='dietaryTagsRow'>
          {state.dietary.blockedTags.map((tag) => (
            <span key={tag} className='pill'>
              {t(`ingredientTags.${tag}`)}
              <button
                type='button'
                className='pill-remove'
                aria-label={t('common.delete')}
                onClick={() => handleRemoveTag(tag)}
              >
                <FaXmark />
              </button>
            </span>
          ))}
          {state.dietary.blockedTags.length === 0 && !addingTag && (
            <span
              className='pill pill-suggestion'
              title={t('settings.dietary.suggestionTitle')}
              onClick={handleTagSuggestionClick}
            >
              + {t('ingredientTags.shellfish')}
            </span>
          )}
          {(() => {
            const remainingTags = INGREDIENT_TAGS.filter(
              (tag) => !state.dietary.blockedTags.includes(tag)
            );
            if (remainingTags.length === 0) return null;
            if (!addingTag) {
              return (
                <button
                  type='button'
                  className='pill-add-btn'
                  aria-label={t('settings.dietary.blockByTag.addBtn')}
                  onClick={() => setAddingTag(true)}
                >
                  +
                </button>
              );
            }
            return (
              <span className='pill-add-inline'>
                <select
                  autoFocus
                  value=''
                  onChange={(e) => {
                    const tag = e.target.value as (typeof INGREDIENT_TAGS)[number];
                    if (tag) {
                      stateStore.addDietaryBlockedTags([tag]);
                      saveData();
                    }
                    setAddingTag(false);
                  }}
                >
                  <option value='' disabled>
                    {t('settings.dietary.blockByTag.pick')}
                  </option>
                  {remainingTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {t(`ingredientTags.${tag}`)}
                    </option>
                  ))}
                </select>
                <button
                  type='button'
                  className='pill-add-cancel'
                  aria-label={t('common.cancel')}
                  onClick={() => setAddingTag(false)}
                >
                  <FaXmark />
                </button>
              </span>
            );
          })()}
        </div>
      </div>

      <div className='field'>
        <div className='dietary-subheading'>{t('settings.dietary.blocklist.label')}</div>
        <p className='dietary-caption'>{t('settings.dietary.blocklist.caption')}</p>
        <div className='pill-row' id='dietaryBlocklistRow'>
          {blocklistIngredients.map((ing) => (
            <span key={ing.id} className='pill'>
              {ingredientDisplayName(ing.name, state.lang)}
              <button
                type='button'
                className='pill-remove'
                aria-label={t('common.delete')}
                onClick={() => handleRemove(ing.id)}
              >
                <FaXmark />
              </button>
            </span>
          ))}
          {blocklistIngredients.length === 0 && !addingIngredient && (
            <span
              className='pill pill-suggestion'
              title={t('settings.dietary.suggestionTitle')}
              onClick={handleIngredientSuggestionClick}
            >
              + {t('ingredientTags.peanut')}
            </span>
          )}
          {addingIngredient ? (
            <span className='pill-add-inline'>
              <input
                type='text'
                autoFocus
                value={query}
                list='dietaryIngSuggestList'
                placeholder={t('settings.dietary.blocklist.addPlaceholder')}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setAddError(null);
                }}
                onKeyDown={handleAddKeyDown}
              />
              <button
                type='button'
                className='pill-add-cancel'
                aria-label={t('common.cancel')}
                onClick={() => {
                  setAddingIngredient(false);
                  setQuery('');
                  setAddError(null);
                }}
              >
                <FaXmark />
              </button>
            </span>
          ) : (
            <button
              type='button'
              className='pill-add-btn'
              aria-label={t('settings.dietary.blocklist.addBtn')}
              onClick={() => setAddingIngredient(true)}
            >
              +
            </button>
          )}
        </div>
        <datalist id='dietaryIngSuggestList'>
          {state.ingredients
            .filter((i) => !state.dietary.blocklist.includes(i.id))
            .map((i) => (
              <option key={i.id} value={ingredientDisplayName(i.name, state.lang)} />
            ))}
        </datalist>
        {addError && <p className='field-error'>{addError}</p>}
      </div>
    </div>
  );
};

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

          {tab === 'dietary' && <DietaryTab />}

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
