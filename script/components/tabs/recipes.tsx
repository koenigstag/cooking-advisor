import React from 'react';
import { LANG_CODES, t, tc, type LANG } from '../../lang/lang.ts';
import { saveData } from '../../database.ts';
import {
  blockedIngredientNames,
  evaluateRecipe,
  type EvaluateRecipeResult,
  fridgeEntry,
  getOrCreateIngredient,
  ingredientDisplayName,
  isIngredientBlocked,
} from '../../ingredient.ts';
import { guessIconId } from '../../icons/icon-map.ts';
import { type Recipe } from '../../store/state.ts';
import { useAppState } from '../../hooks/use-app-state.ts';
import { stateStore } from '../../store/store.ts';
import { uid } from '../../utils.ts';
import { RecipeModal } from '../recipe-modal.tsx';
import { MealTypePills } from '../meal-type-pills.tsx';
import { Accordion } from '../accordion.tsx';
import {
  fetchLibraryRecipes,
  getServerBaseUrl,
  type LibraryRecipe,
} from '../../server-api.ts';

function addLibraryRecipeToMine(libRecipe: LibraryRecipe): Recipe {
  const lang = libRecipe.lang ?? (stateStore.getState().lang as LANG);
  const items = libRecipe.items.map((item) => {
    const ing = getOrCreateIngredient(item.name, guessIconId(item.name), lang)!;
    return {
      ingredientId: ing.id,
      name: ingredientDisplayName(ing.name, lang),
      amount: item.amount,
      unit: item.unit,
    };
  });

  const newRecipe: Recipe = {
    id: uid(),
    name: libRecipe.name,
    description: libRecipe.description,
    items,
    mealTypes: libRecipe.mealTypes,
  };

  stateStore.setRecipes([...stateStore.getState().recipes, newRecipe]);
  saveData();
  return newRecipe;
}

const MANY_RECIPES_THRESHOLD = 6;

function matchesSearch(
  name: string,
  items: { name: string }[],
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (name.toLowerCase().includes(q)) return true;
  return items.some((it) => it.name.toLowerCase().includes(q));
}

const MyRecipeCard = ({
  recipe,
  ev,
}: {
  recipe: Recipe;
  ev: EvaluateRecipeResult;
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const dietary = stateStore.getState().dietary;
  const blockedNames = blockedIngredientNames(recipe.items);

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

  const handleCardClick = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleEditClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    stateStore.setEditingRecipeId(recipe.id);
    stateStore.setActiveTab('addRecipe');
  };

  const handleDeleteClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm(t('recipeList.actions.confirmDelete'))) {
      stateStore.setRecipes(
        stateStore.getState().recipes.filter((r) => r.id !== recipe.id)
      );
      saveData();
      handleModalClose();
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
        {recipe.description && <p className='rc-desc'>{recipe.description}</p>}
        <div className='rc-footer'>
          {statusLabelEl}
          <div style={{ marginTop: '5px' }}>
            {t('recipeList.status.matchedIngredients', {
              matched: ev.matched,
              total: ev.total,
            })}
          </div>
        </div>
        {dietary.action === 'warn' && blockedNames.length > 0 && (
          <div className='status-label diet-warn' style={{ marginTop: '6px' }}>
            {t('recipeList.status.dietBlocked', { list: blockedNames.join(', ') })}
          </div>
        )}
        <div className='rc-actions'>
          <button data-edit={recipe.id} onClick={handleEditClick}>
            {t('common.edit')}
          </button>
          <button data-del={recipe.id} onClick={handleDeleteClick}>
            {t('common.delete')}
          </button>
        </div>
      </div>
      <RecipeModal
        source={{ kind: 'mine', recipe, ev }}
        open={isModalOpen}
        onClose={handleModalClose}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
    </React.Fragment>
  );
};

const LibraryRecipeCard = ({ recipe }: { recipe: LibraryRecipe }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [addedRecipe, setAddedRecipe] = React.useState<Recipe | null>(null);

  const dietary = stateStore.getState().dietary;
  const blockedNames = blockedIngredientNames(recipe.items);

  const handleModalClose = () => setIsModalOpen(false);

  const handleAddToMyRecipes = () => {
    setAddedRecipe(addLibraryRecipeToMine(recipe));
  };

  const handleEditClick = () => {
    if (!addedRecipe) return;
    stateStore.setEditingRecipeId(addedRecipe.id);
    stateStore.setActiveTab('addRecipe');
  };

  const handleDeleteClick = () => {
    if (!addedRecipe) return;
    if (confirm(t('recipeList.actions.confirmDelete'))) {
      stateStore.setRecipes(
        stateStore.getState().recipes.filter((r) => r.id !== addedRecipe.id)
      );
      saveData();
      setAddedRecipe(null);
      handleModalClose();
    }
  };

  const modalSource = addedRecipe
    ? { kind: 'mine' as const, recipe: addedRecipe, ev: evaluateRecipe(addedRecipe) }
    : { kind: 'library' as const, recipe };

  return (
    <React.Fragment>
      <div className='recipe-card' onClick={() => setIsModalOpen(true)}>
        <div className='rc-head'>
          <h3>{recipe.name}</h3>
        </div>
        <MealTypePills mealTypes={recipe.mealTypes} />
        {recipe.description && <p className='rc-desc'>{recipe.description}</p>}
        {dietary.action === 'warn' && blockedNames.length > 0 && (
          <div className='status-label diet-warn' style={{ marginTop: '6px' }}>
            {t('recipeList.status.dietBlocked', { list: blockedNames.join(', ') })}
          </div>
        )}
      </div>
      <RecipeModal
        source={modalSource}
        open={isModalOpen}
        onClose={handleModalClose}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onAddToMyRecipes={handleAddToMyRecipes}
      />
    </React.Fragment>
  );
};

export const RecipesTab = () => {
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [recipeSearch, setRecipeSearch] = React.useState('');
  const [libraryRecipes, setLibraryRecipes] = React.useState<LibraryRecipe[]>(
    []
  );
  const [libraryStatus, setLibraryStatus] = React.useState<
    'loading' | 'ready' | 'error' | 'disabled'
  >('loading');

  const state = useAppState();
  const visibleIngredients = state.ingredients.filter(
    (i) => !isIngredientBlocked(i.id)
  );
  const hasIngredients = visibleIngredients.length > 0;
  const hasRecipes = state.recipes.length > 0;

  React.useEffect(() => {
    if (!getServerBaseUrl()) {
      setLibraryRecipes([]);
      setLibraryStatus('disabled');
      return;
    }
    let cancelled = false;
    setLibraryStatus('loading');
    fetchLibraryRecipes(state.lang)
      .then((recipes) => {
        if (cancelled) return;
        setLibraryRecipes(recipes);
        setLibraryStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setLibraryStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [state.lang, state.serverBaseUrl]);

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

  const passesDietFilter = (items: { ingredientId?: string; name: string }[]) =>
    state.dietary.action !== 'hide' || blockedIngredientNames(items).length === 0;

  const filteredMyRecipes = state.recipes.filter(
    (r) => matchesSearch(r.name, r.items, recipeSearch) && passesDietFilter(r.items)
  );
  const filteredLibraryRecipes = libraryRecipes.filter(
    (r) => matchesSearch(r.name, r.items, recipeSearch) && passesDietFilter(r.items)
  );

  const hasVisibleMyRecipes = filteredMyRecipes.length > 0;
  const recommendedMyOpen = hasVisibleMyRecipes;
  const recommendedLibraryOpen =
    !hasVisibleMyRecipes || state.recipes.length <= MANY_RECIPES_THRESHOLD;

  const [myOpen, setMyOpen] = React.useState(recommendedMyOpen);
  const [libraryOpen, setLibraryOpen] = React.useState(recommendedLibraryOpen);

  React.useEffect(() => {
    setMyOpen(recommendedMyOpen);
    setLibraryOpen(recommendedLibraryOpen);
  }, [recommendedMyOpen, recommendedLibraryOpen]);

  const handleToggleMyRecipes = (nextOpen: boolean) => {
    setMyOpen(nextOpen);
    if (!nextOpen) setLibraryOpen(true);
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
                visibleIngredients
                  .slice()
                  .sort((a, b) =>
                    ingredientDisplayName(a.name, state.lang).localeCompare(
                      ingredientDisplayName(b.name, state.lang),
                      LANG_CODES[state.lang as LANG]
                    )
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
                        {ingredientDisplayName(ing.name, state.lang)}
                      </span>
                    );
                  })
              ) : (
                <span className={`chip`}>
                  {visibleIngredients.length}{' '}
                  {tc('recipeList.ingredients', visibleIngredients.length)}
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
          marginBottom: '20px',
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
      </div>

      <Accordion
        title={t('recipeList.myRecipes')}
        count={filteredMyRecipes.length}
        open={myOpen}
        onToggle={handleToggleMyRecipes}
      >
        {!hasRecipes ? (
          <div className='empty-state'>
            <div className='display'>{t('recipeList.noRecipesTitle')}</div>
            <p>{t('recipeList.noRecipesHint')}</p>
          </div>
        ) : filteredMyRecipes.length === 0 ? (
          <div className='empty-state'>
            <div className='display'>{t('recipeList.noResultsTitle')}</div>
          </div>
        ) : (
          <div className='recipe-grid'>
            {filteredMyRecipes.map((r) => {
              const ev = evaluateRecipe(r);
              return <MyRecipeCard key={r.id} recipe={r} ev={ev} />;
            })}
          </div>
        )}
      </Accordion>

      <Accordion
        title={t('recipeList.library')}
        count={libraryStatus === 'ready' ? filteredLibraryRecipes.length : undefined}
        open={libraryOpen}
        onToggle={setLibraryOpen}
      >
        {libraryStatus === 'disabled' && (
          <div className='library-status'>{t('recipeList.libraryDisabled')}</div>
        )}
        {libraryStatus === 'loading' && (
          <div className='library-status'>{t('recipeList.libraryLoading')}</div>
        )}
        {libraryStatus === 'error' && (
          <div className='library-status'>{t('recipeList.libraryLoadError')}</div>
        )}
        {libraryStatus === 'ready' &&
          (libraryRecipes.length === 0 ? (
            <div className='library-status'>{t('recipeList.libraryEmpty')}</div>
          ) : filteredLibraryRecipes.length === 0 ? (
            <div className='library-status'>{t('recipeList.noResultsTitle')}</div>
          ) : (
            <div className='recipe-grid'>
              {filteredLibraryRecipes.map((r) => (
                <LibraryRecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          ))}
      </Accordion>
    </div>
  );
};
