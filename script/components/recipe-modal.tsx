import React from 'react';
import { FaXmark } from 'react-icons/fa6';
import { t } from '../lang/lang.ts';
import {
  type EvaluateRecipeResult,
  fridgeEntry,
  ingredientName,
} from '../ingredient.ts';
import { type Recipe, type RecipeItem } from '../store/state.ts';
import { type LibraryRecipe, type LibraryRecipeItem } from '../server-api.ts';
import { MealTypePills } from './meal-type-pills.tsx';

export type RecipeModalSource =
  | { kind: 'mine'; recipe: Recipe; ev: EvaluateRecipeResult }
  | { kind: 'library'; recipe: LibraryRecipe };

export interface RecipeModalProps {
  source: RecipeModalSource;
  open: boolean;
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddToMyRecipes?: () => void;
}

function isMineItem(
  item: RecipeItem | LibraryRecipeItem
): item is RecipeItem {
  return 'ingredientId' in item;
}

export const RecipeModal = ({
  source,
  open,
  onClose,
  onEdit,
  onDelete,
  onAddToMyRecipes,
}: RecipeModalProps) => {
  const { recipe } = source;
  const ev = source.kind === 'mine' ? source.ev : undefined;

  return (
    <div className='modal-overlay' hidden={!open} onClick={onClose}>
      <div
        className='modal-card recipe-modal-card'
        role='dialog'
        aria-modal='true'
        aria-labelledby='recipeModalTitle'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='modal-head'>
          <h3 id='recipeModalTitle'>{recipe.name}</h3>
          <button
            className='modal-close'
            aria-label={t('common.close')}
            onClick={onClose}
          >
            <FaXmark />
          </button>
        </div>
        <div className='modal-body'>
          <MealTypePills mealTypes={recipe.mealTypes} />
          <div className='rc-ingredients'>
            {recipe.items.map((item, idx) => {
              const mine = isMineItem(item);
              const displayName = mine ? ingredientName(item.ingredientId) : item.name;
              const isMissing = mine ? !fridgeEntry(item.ingredientId).inStock : false;
              const isWarn =
                mine && ev
                  ? ev.warnList.some((w) => w.ingredientId === item.ingredientId)
                  : false;
              const statusClass = mine
                ? isMissing
                  ? 'missing'
                  : isWarn
                    ? 'warn'
                    : 'on'
                : '';
              return (
                <span
                  key={mine ? item.ingredientId : `${item.name}-${idx}`}
                  className={`chip readonly ${statusClass}`}
                >
                  <span className='dot'></span>
                  {displayName}
                  {item.amount != null && (
                    <small>
                      {item.amount}
                      {item.unit ? ' ' + item.unit : ''}
                    </small>
                  )}
                  {isWarn && <small>{t('recipeList.status.warnLowStock')}</small>}
                </span>
              );
            })}
          </div>
          {recipe.description && (
            <p className='recipe-modal-desc'>{recipe.description}</p>
          )}
        </div>
        <div className='modal-footer'>
          {source.kind === 'mine' ? (
            <>
              <button className='btn secondary' onClick={onEdit}>
                {t('common.edit')}
              </button>
              <button className='btn danger' onClick={onDelete}>
                {t('common.delete')}
              </button>
            </>
          ) : (
            <button className='btn' onClick={onAddToMyRecipes}>
              {t('recipeList.addToMyRecipes')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
