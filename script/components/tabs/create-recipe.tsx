import React from 'react';
import { FaXmark } from 'react-icons/fa6';
import { t } from '../../lang/lang.ts';
import { saveData } from '../../database.ts';
import { getOrCreateIngredient, ingredientName } from '../../ingredient.ts';
import { units } from '../../options.ts';
import type { Recipe, RecipeItem } from '../../store/state.ts';
import { uid } from '../../utils.ts';
import { useAppState } from '../../hooks/use-app-state.ts';
import { stateStore } from '../../store/store.ts';

const defaultDraftData = {
  forId: 'new',
  name: '',
  description: '',
  items: [
    {
      ingredientId: null,
      name: '',
      amount: null,
      unit: null,
    } as unknown as RecipeItem,
  ],
};

export const AddRecipeTab = () => {
  const state = useAppState();
  const [draftData, setDraftData] = React.useState<{
    forId: string;
    name: string;
    description: string;
    items: RecipeItem[];
  }>(defaultDraftData);

  const editing = state.editingRecipeId
    ? state.recipes.find((r) => r.id === state.editingRecipeId)
    : undefined;

  const startDraft = (recipe?: Recipe) => {
    if (recipe) {
      setDraftData({
        forId: recipe.id,
        name: recipe.name,
        description: recipe.description,
        items: recipe.items.map((it) => ({
          ingredientId: it.ingredientId,
          name: ingredientName(it.ingredientId),
          amount: it.amount,
          unit: it.unit,
        })),
      });
    } else {
      setDraftData(defaultDraftData);
    }
  };

  const handleAddRow = () => {
    setDraftData((prev) => ({
      ...prev,
      items: [...prev.items, defaultDraftData.items[0]],
    }));
  };

  const handleRemoveRow = (idx: number) => {
    setDraftData((prev) => {
      const newItems = [...prev.items];
      newItems.splice(idx, 1);
      if (newItems.length === 0) {
        newItems.push(defaultDraftData.items[0]);
      }
      return { ...prev, items: newItems };
    });
  };

  const handleEditIngredient = (idx: number, newData: Partial<RecipeItem>) => {
    setDraftData((prev) => {
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], ...newData };
      return { ...prev, items: newItems };
    });
  };

  const handleSaveRecipe = () => {
    const name = draftData.name.trim();
    if (!name) {
      alert(t('addRecipe.actions.saveAlert.noName'));
      return;
    }
    const items: RecipeItem[] = [];
    draftData.items.forEach((it) => {
      const n = (it.name || '').trim();
      if (!n) return;
      const ing = getOrCreateIngredient(n);
      if (!ing) return;
      items.push({
        ingredientId: ing.id,
        name: n,
        amount: it.amount,
        unit: it.unit,
      });
    });
    if (items.length === 0) {
      alert(t('addRecipe.actions.saveAlert.noIngredients'));
      return;
    }
    if (editing) {
      editing.name = name;
      editing.description = draftData.description.trim();
      editing.items = items;
    } else {
      state.recipes.push({
        id: uid(),
        name,
        description: draftData.description.trim(),
        items,
      });
    }
    saveData();
    setDraftData(defaultDraftData);
    stateStore.setEditingRecipeId(null);
  };

  const handleCancelEdit = () => {
    setDraftData(defaultDraftData);
    stateStore.setEditingRecipeId(null);
  };

  const handleEditRecipe = (recipeId: string) => {
    const recipe = state.recipes.find((r) => r.id === recipeId);
    if (!recipe) return;
    startDraft(recipe);
    stateStore.setEditingRecipeId(recipe.id);
  };

  const handleDeleteRecipe = (recipeId: string) => {
    if (confirm(t('addRecipe.actions.confirmDelete'))) {
      stateStore.setRecipes(state.recipes.filter((rec) => rec.id !== recipeId));
      saveData();
      setDraftData(defaultDraftData);
      if (state.editingRecipeId === recipeId) {
        stateStore.setEditingRecipeId(null);
      }
    }
  };

  function draftItemsNeedsReset() {
    return false;
  }

  React.useEffect(() => {
    if (
      draftData.items.length === 0 ||
      (editing && draftData.forId !== editing.id) ||
      (!editing && draftData.forId !== 'new' && draftItemsNeedsReset())
    ) {
      startDraft(editing);
    }
  }, []);

  return (
    <div className='card'>
      <h3 style={{ marginTop: '0' }}>
        {editing ? t('addRecipe.editRecipe') : t('addRecipe.addRecipe')}
      </h3>
      <div className='field'>
        <label>{t('addRecipe.fields.name.label')}</label>
        <input
          type='text'
          id='recName'
          placeholder={t('addRecipe.fields.name.placeholder')}
          value={draftData.name}
          onChange={(e) => setDraftData({ ...draftData, name: e.target.value })}
        />
      </div>
      <div className='field'>
        <label>{t('addRecipe.fields.description.label')}</label>
        <textarea
          id='recDesc'
          placeholder={t('addRecipe.fields.description.placeholder')}
          value={draftData.description}
          onChange={(e) =>
            setDraftData({ ...draftData, description: e.target.value })
          }
        />
      </div>
      <label>{t('addRecipe.fields.ingredients.label')}</label>
      <div id='ingRows'>
        {draftData.items.map((item, idx) => (
          <div className='ing-row' data-idx={idx.toString()} key={idx}>
            <div className='field'>
              <input
                type='text'
                placeholder={t(
                  'addRecipe.fields.ingredients.fields.name.placeholder'
                )}
                value={item.name}
                data-role='name'
                list='ingSuggestList2'
                onChange={(e) => {
                  handleEditIngredient(idx, { name: e.target.value });
                }}
              />
            </div>
            <div className='field'>
              <input
                type='number'
                min={0}
                step='any'
                placeholder={t(
                  'addRecipe.fields.ingredients.fields.quantity.placeholder'
                )}
                value={item.amount != null ? item.amount.toString() : ''}
                data-role='amount'
                onChange={(e) => {
                  handleEditIngredient(idx, {
                    amount:
                      e.target.value !== '' ? parseFloat(e.target.value) : null,
                  });
                }}
              />
            </div>
            <div className='field'>
              <input
                type='text'
                placeholder={t(
                  'addRecipe.fields.ingredients.fields.unit.placeholder'
                )}
                value={item.unit || ''}
                data-role='unit'
                list='unitSuggestList2'
                onChange={(e) => {
                  handleEditIngredient(idx, {
                    unit: e.target.value.trim() || null,
                  });
                }}
              />
            </div>
            <button
              className='icon-btn'
              data-remove={idx.toString()}
              title={t('addRecipe.fields.ingredients.actions.removeRow')}
              onClick={() => handleRemoveRow(idx)}
            >
              <FaXmark />
            </button>
          </div>
        ))}
      </div>
      <datalist id='ingSuggestList2'>
        {state.ingredients.map((i) => (
          <option key={i.id} value={i.name} />
        ))}
      </datalist>
      <datalist id='unitSuggestList2'>
        {units.map((u) => (
          <option key={u} value={t(`units.${u}`)} />
        ))}
      </datalist>
      <button
        className={['btn', 'ghost'].join(' ')}
        id='addRowBtn'
        onClick={handleAddRow}
      >
        {t('addRecipe.fields.ingredients.actions.addRow')}
      </button>
      <div
        style={{
          marginTop: '18px',
          display: 'flex',
          gap: '10px',
        }}
      >
        <button className='btn' id='saveRecipeBtn' onClick={handleSaveRecipe}>
          {editing ? t('common.change') : t('addRecipe.actions.addRecipe')}
        </button>
        {editing && (
          <button
            className={['btn', 'secondary'].join(' ')}
            id='cancelEditBtn'
            onClick={handleCancelEdit}
          >
            {t('common.cancel')}
          </button>
        )}
      </div>
      <div className='section-title'>
        {t('addRecipe.recipesCount', { count: state.recipes.length })}
      </div>
      {state.recipes.length === 0 ? (
        <div className='empty-hint'>{t('addRecipe.noRecipes')}</div>
      ) : (
        <div className='recipe-list-compact'>
          {state.recipes
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
            .map((r) => (
              <div className='rlc-row' key={r.id}>
                <div>
                  <div className='rname'>{r.name}</div>
                  <div className='rmeta'>
                    {t('addRecipe.ingredientsCount', { count: r.items.length })}
                  </div>
                </div>
                <div className='rlc-actions'>
                  <button
                    data-editc={r.id}
                    onClick={() => handleEditRecipe(r.id)}
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    className='danger'
                    data-delc={r.id}
                    onClick={() => handleDeleteRecipe(r.id)}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
