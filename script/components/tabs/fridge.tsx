import React from 'react';
import { FaXmark } from 'react-icons/fa6';
import { t, tc } from '../../lang/lang.ts';
import { saveData } from '../../database/index.ts';
import {
  fridgeEntry,
  getOrCreateIngredient,
  ingredientDisplayName,
  isIngredientBlocked,
} from '../../ingredient.ts';
import { Icon } from '../../icons/icon.tsx';
import { IconPicker } from '../../icons/icon-picker.tsx';
import { guessIconId, type IconId } from '../../icons/icon-map.ts';
import { units } from '../../options.ts';
import { stateStore } from '../../store/store.ts';
import { useAppState } from '../../hooks/use-app-state.ts';
import { INGREDIENT_TAGS, type IngredientTag } from '../../store/state.ts';
import { Accordion } from '../accordion.tsx';
import { ErrorBoundary } from '../error-boundary.tsx';
import { useConfirm } from '../confirm-dialog.tsx';

export const FridgeTab = () => {
  const state = useAppState();
  const confirmDialog = useConfirm();

  const [name, setName] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [unit, setUnit] = React.useState(() => t('units.gram'));
  const [calories, setCalories] = React.useState('');
  const [iconId, setIconId] = React.useState<IconId | undefined>(undefined);
  const [iconTouched, setIconTouched] = React.useState(false);
  const [tags, setTags] = React.useState<IngredientTag[]>([]);
  const [addingTag, setAddingTag] = React.useState(false);
  const [blockedOpen, setBlockedOpen] = React.useState(false);

  React.useEffect(() => {
    if (iconTouched) return;
    setIconId(guessIconId(name));
  }, [name, iconTouched]);

  const handleIconChange = (id: IconId | undefined) => {
    setIconTouched(true);
    setIconId(id);
  };

  const handleToggleTag = (tag: IngredientTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((tg) => tg !== tag) : [...prev, tag]
    );
  };

  const handleAddProduct = () => {
    const ing = getOrCreateIngredient(name, iconId, state.lang, tags);
    if (!ing) return;

    const amountValue = amount !== '' ? parseFloat(amount) : null;
    const unitValue = unit.trim() || null;
    stateStore.setFridgeEntry(ing.id, {
      inStock: true,
      amount: amountValue,
      unit: unitValue,
    });
    if (calories !== '') {
      stateStore.setIngredientCalories(ing.id, parseFloat(calories));
    }
    saveData();

    setName('');
    setAmount('');
    setUnit(t('units.gram'));
    setCalories('');
    setIconId(undefined);
    setIconTouched(false);
    setTags([]);
    setAddingTag(false);
  };

  const handleInStockChange = (ingId: string) => {
    const fe = fridgeEntry(ingId);
    stateStore.setFridgeEntry(ingId, { ...fe, inStock: !fe.inStock });
    saveData();
  };

  const handleAmountChange = (ingId: string, value: string) => {
    const fe = fridgeEntry(ingId);
    const amountValue = value !== '' ? parseFloat(value) : null;
    stateStore.setFridgeEntry(ingId, {
      ...fe,
      amount: amountValue,
      inStock: amountValue != null ? true : fe.inStock,
    });
    saveData();
  };

  const handleUnitChange = (ingId: string, value: string) => {
    const fe = fridgeEntry(ingId);
    stateStore.setFridgeEntry(ingId, { ...fe, unit: value.trim() || null });
    saveData();
  };

  const handleCaloriesChange = (ingId: string, value: string) => {
    stateStore.setIngredientCalories(ingId, value !== '' ? parseFloat(value) : null);
    saveData();
  };

  const handleRemoveProduct = async (ingId: string) => {
    const usedIn = state.recipes.filter((r) =>
      r.items.some((it) => it.ingredientId === ingId)
    );
    let msg = t('fridge.productsList.actions.confirmDelete');
    if (usedIn.length) {
      msg = tc(
        'fridge.productsList.actions.confirmDeleteWhenUsed',
        usedIn.length
      );
    }
    if (await confirmDialog({ text: msg, danger: true })) {
      stateStore.setIngredients(
        stateStore.getState().ingredients.filter((i) => i.id !== ingId)
      );
      stateStore.removeFridgeEntry(ingId);
      stateStore.setRecipes(
        stateStore.getState().recipes.map((r) => ({
          ...r,
          items: r.items.filter((it) => it.ingredientId !== ingId),
        }))
      );
      saveData();
    }
  };

  return (
    <React.Fragment>
      <ErrorBoundary title={t('tabError.title')} hint={t('tabError.hint')}>
        <div className='card'>
          <h3 style={{ marginTop: '0' }}>{t('fridge.title')}</h3>
          <div className='field-row'>
            <div className='field' style={{ flex: '0 0 auto' }}>
              <label>{t('fridge.fields.icon.label')}</label>
              <IconPicker
                value={iconId}
                onChange={handleIconChange}
                title={t('fridge.fields.icon.label')}
              />
            </div>
            <div className='field' style={{ flex: '1 1 auto' }}>
              <label>{t('fridge.fields.name.label')}</label>
              <input
                type='text'
                id='newIngName'
                placeholder={t('fridge.fields.name.placeholder')}
                list='ingSuggestList'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <datalist id='ingSuggestList'>
                {state.ingredients
                  .filter((i) => !isIngredientBlocked(i.id))
                  .map((i) => (
                    <option
                      key={i.id}
                      value={ingredientDisplayName(i.name, state.lang)}
                    />
                  ))}
              </datalist>
            </div>
            <div className='field' style={{ flex: '0 0 200px' }}>
              <div className='qty-unit-field-labels'>
                <label>{t('fridge.fields.amount.label')}</label>
                <label>{t('fridge.fields.unit.label')}</label>
              </div>
              <div className='qty-unit-field-group'>
                <input
                  type='number'
                  id='newIngAmount'
                  placeholder={t('fridge.fields.amount.placeholder')}
                  min={0}
                  step='any'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <input
                  type='text'
                  id='newIngUnit'
                  placeholder={t('fridge.fields.unit.placeholder')}
                  list='unitSuggestList'
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
              <datalist id='unitSuggestList'>
                {units.map((u) => (
                  <option key={u} value={t(`units.${u}`)} />
                ))}
              </datalist>
            </div>
            <div className='field' style={{ flex: '0 0 220px' }}>
              <label>{t('fridge.fields.calories.label')}</label>
              <input
                type='number'
                id='newIngCalories'
                placeholder={t('fridge.fields.calories.placeholder')}
                min={0}
                step='any'
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
          </div>
          <div className='field'>
            <label>{t('fridge.fields.tags.label')}</label>
            <div className='pill-row' id='newIngTagsRow'>
              {tags.map((tag) => (
                <span key={tag} className='pill'>
                  {t(`ingredientTags.${tag}`)}
                  <button
                    type='button'
                    className='pill-remove'
                    aria-label={t('common.delete')}
                    onClick={() => handleToggleTag(tag)}
                  >
                    <FaXmark />
                  </button>
                </span>
              ))}
              {(() => {
                const remainingTags = INGREDIENT_TAGS.filter(
                  (tag) => !tags.includes(tag)
                );
                if (remainingTags.length === 0) return null;
                if (!addingTag) {
                  return (
                    <button
                      type='button'
                      className='pill-add-btn'
                      aria-label={t('fridge.fields.tags.addBtn')}
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
                        const tag = e.target.value as IngredientTag;
                        if (tag) setTags((prev) => [...prev, tag]);
                        setAddingTag(false);
                      }}
                    >
                      <option value='' disabled>
                        {t('fridge.fields.tags.pick')}
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
          <button className='btn' id='addIngBtn' onClick={handleAddProduct}>
            {t('fridge.actions.addProduct')}
          </button>
        </div>
      </ErrorBoundary>
      <div className='section-title'>
        {t('fridge.productsList.title', {
          count: state.ingredients.length,
        })}
      </div>
      {state.ingredients.length === 0 ? (
        <div className='empty-state'>
          <div className='display'>
            {t('fridge.productsList.emptyState.title')}
          </div>
          <p>{t('fridge.productsList.emptyState.hint')}</p>
        </div>
      ) : (
        (() => {
          const sortByName = (a: (typeof state.ingredients)[number], b: (typeof state.ingredients)[number]) =>
            ingredientDisplayName(a.name, state.lang).localeCompare(
              ingredientDisplayName(b.name, state.lang),
              'ru'
            );
          const visibleIngredients = state.ingredients
            .filter((i) => !isIngredientBlocked(i.id))
            .sort(sortByName);
          const blockedIngredients = state.ingredients
            .filter((i) => isIngredientBlocked(i.id))
            .sort(sortByName);

          const renderRow = (ing: (typeof state.ingredients)[number]) => {
            const fe = fridgeEntry(ing.id);
            const isBlocked = isIngredientBlocked(ing.id);
            return (
              <div
                className={`fridge-row ${isBlocked ? 'diet-blocked' : ''}`}
                data-row={ing.id}
                key={ing.id}
              >
                <input
                  type='checkbox'
                  checked={fe.inStock}
                  onChange={() => handleInStockChange(ing.id)}
                />
                {ing.iconId && (
                  <span className='ing-icon'>
                    <Icon id={ing.iconId} />
                  </span>
                )}
                <span className='name'>
                  {ingredientDisplayName(ing.name, state.lang)}
                  {isBlocked && (
                    <small className='diet-blocked-tag'>
                      {t('fridge.productsList.dietBlockedTag')}
                    </small>
                  )}
                </span>
                <div className='qty-inputs'>
                  <div className='qty-unit-group'>
                    <input
                      type='number'
                      min={0}
                      step='any'
                      placeholder={t(
                        'fridge.productsList.ingredient.fields.quantity.placeholder'
                      )}
                      value={fe.amount != null ? fe.amount : ''}
                      onChange={(e) => handleAmountChange(ing.id, e.target.value)}
                    />
                    <input
                      type='text'
                      placeholder={t(
                        'fridge.productsList.ingredient.fields.unit.placeholder'
                      )}
                      value={fe.unit ? fe.unit : ''}
                      onChange={(e) => handleUnitChange(ing.id, e.target.value)}
                    />
                  </div>
                  <span className='calories-input-wrap'>
                    <input
                      type='number'
                      min={0}
                      step='any'
                      className='calories-input'
                      title={t('fridge.productsList.ingredient.fields.calories.title')}
                      placeholder={t(
                        'fridge.productsList.ingredient.fields.calories.placeholder'
                      )}
                      value={ing.calories != null ? ing.calories : ''}
                      onChange={(e) => handleCaloriesChange(ing.id, e.target.value)}
                    />
                    <span className='calories-input-suffix'>
                      {t('fridge.productsList.ingredient.fields.calories.unit')}
                    </span>
                  </span>
                </div>
                <button
                  className='del'
                  data-deling={ing.id}
                  onClick={() => handleRemoveProduct(ing.id)}
                >
                  {t('fridge.productsList.actions.remove')}
                </button>
              </div>
            );
          };

          return (
            <React.Fragment>
              <div className='fridge-list'>
                {visibleIngredients.map(renderRow)}
              </div>
              {blockedIngredients.length > 0 && (
                <Accordion
                  title={t('fridge.productsList.blockedAccordion.title')}
                  count={blockedIngredients.length}
                  open={blockedOpen}
                  onToggle={setBlockedOpen}
                >
                  <div className='fridge-list'>
                    {blockedIngredients.map(renderRow)}
                  </div>
                </Accordion>
              )}
            </React.Fragment>
          );
        })()
      )}
    </React.Fragment>
  );
};
