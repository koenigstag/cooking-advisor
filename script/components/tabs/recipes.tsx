import React from 'react';
import { LANG_CODES, t, type LANG } from '../../lang/lang.ts';
import { saveData } from '../../database.ts';
import { loadExampleData } from '../../example-data.ts';
import {
  evaluateRecipe,
  type EvaluateRecipeResult,
  fridgeEntry,
} from '../../ingredient.ts';
import { type Recipe } from '../../store/state.ts';
import { useAppState } from '../../hooks/use-app-state.ts';
import { stateStore } from '../../store/store.ts';
import { isMobile } from '../../constants/index.ts';
import { RecipeModal } from '../recipe-modal.tsx';
import { MealTypePills } from '../meal-type-pills.tsx';

const RecipeCard = ({
  recipe,
  ev,
}: {
  recipe: Recipe;
  ev: EvaluateRecipeResult;
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fullMatch = ev.status === 'full';
  let statusLabelEl: React.ReactNode;
  if (ev.status === 'full')
    statusLabelEl = (
      <span className='status-label'>{t('recipeList.status.canCook')}</span>
    );
  else if (ev.status === 'partial')
    statusLabelEl = (
      <span className='status-label partial'>
        {t('recipeList.status.missingIngredients', {
          count: ev.missingList.length + ev.warnList.length,
        })}
      </span>
    );
  else
    statusLabelEl = (
      <span className='status-label none'>
        {t('recipeList.status.noIngredients')}
      </span>
    );

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    stateStore.setActiveTab('addRecipe');
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t('recipeList.actions.confirmDelete'))) {
      stateStore.setRecipes(
        stateStore.getState().recipes.filter((r) => r.id !== id)
      );
      saveData();
    }
  };

  return (
    <React.Fragment>
      <div
        className={`recipe-card ${fullMatch ? 'full-match' : ''}`}
        onClick={handleCardClick}
      >
        <div className='rc-head'>
          <h3>{recipe.name}</h3>
        </div>
        <MealTypePills mealTypes={recipe.mealTypes} />
        {recipe.description && (
          <p className='rc-desc'>{recipe.description}</p>
        )}
        <div className='rc-footer'>
          {statusLabelEl}
          <div style={{ marginTop: '5px' }}>
            {t('recipeList.status.matchedIngredients', {
              matched: ev.matched,
              total: ev.total,
            })}
          </div>
        </div>
        <div className='rc-actions'>
          <button
            data-edit={recipe.id}
            onClick={(e) => handleEditClick(e, recipe.id)}
          >
            {t('common.edit')}
          </button>
          <button
            data-del={recipe.id}
            onClick={(e) => handleDeleteClick(e, recipe.id)}
          >
            {t('common.delete')}
          </button>
        </div>
      </div>
      <RecipeModal
        recipe={recipe}
        ev={ev}
        open={isModalOpen}
        onClose={handleModalClose}
      />
    </React.Fragment>
  );
};

export const RecipesTab = () => {
  const [filterOpen, setFilterOpen] = React.useState(isMobile ? false : true);
  const [recipeSearch, setRecipeSearch] = React.useState('');

  const state = useAppState();
  const hasIngredients = state.ingredients.length > 0;
  const hasRecipes = state.recipes.length > 0;

  const handleToggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleChipClick = (id: string) => {
    if (!id) return;

    const fe = fridgeEntry(id);
    stateStore.setFridgeEntry(id, {
      inStock: !fe.inStock,
      amount: fe.amount,
      unit: fe.unit,
    });
    saveData();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipeSearch(e.target.value);
  };

  const handleUseExampleData = async () => {
    const { addedRecipes } = await loadExampleData(state.lang);
    if (addedRecipes > 0) {
      alert(t('exampleData.successMessage', { added: addedRecipes }));
    } else {
      alert(t('exampleData.alreadyLoaded'));
    }
  };

  return (
    <div className='filter-panel'>
      <div className='fp-head'>
        <h3>{t('recipeList.whatIHave')}</h3>
        {!hasIngredients ? (
          <div className='empty-hint'>{t('recipeList.noIngredientsHint')}</div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minHeight: '30px',
            }}
          >
            <div className='chip-row' id='filterChips'>
              {filterOpen ? (
                state.ingredients
                  .slice()
                  .sort((a, b) =>
                    a.name.localeCompare(b.name, LANG_CODES[state.lang as LANG])
                  )
                  .map((ing) => {
                    const fe = fridgeEntry(ing.id);
                    return (
                      <span
                        key={ing.id}
                        className={`chip ${fe.inStock ? 'on' : ''}`}
                        data-ing={ing.id}
                        onClick={() => handleChipClick(ing.id)}
                      >
                        <span className='dot'></span>
                        {ing.name}
                      </span>
                    );
                  })
              ) : (
                <span className={`chip`}>
                  {state.ingredients.length} {t('recipeList.ingredients')}
                </span>
              )}
            </div>
            <a id='toggleFilter' onClick={handleToggleFilter}>
              {filterOpen ? t('recipeList.collapse') : t('recipeList.expand')}
            </a>
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <input
          type='text'
          id='recipeSearch'
          placeholder={t('recipeList.searchPlaceholder')}
          value={recipeSearch}
          onChange={handleSearchChange}
        />
        <span
          style={{
            fontSize: '12.5px',
            color: 'var(--ink-soft)',
          }}
        >
          {hasRecipes
            ? state.recipes.length + ' ' + t('recipeList.recipesEnding')
            : ''}
        </span>
      </div>
      {!hasRecipes ? (
        <div className='empty-state'>
          <div className='display'>{t('recipeList.noRecipesTitle')}</div>
          <p>{t('recipeList.noRecipesHint')}</p>
          <p>{t('exampleData.hint')}</p>
          <button
            className='btn'
            id='useExampleDataBtn'
            onClick={handleUseExampleData}
          >
            {t('exampleData.useBtn')}
          </button>
        </div>
      ) : (
        <div className='recipe-grid'>
          {state.recipes.map((r) => {
            const ev = evaluateRecipe(r);
            return <RecipeCard key={r.id} recipe={r} ev={ev} />;
          })}
        </div>
      )}
    </div>
  );
};
