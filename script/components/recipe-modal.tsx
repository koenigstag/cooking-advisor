import React from 'react';
import { FaXmark } from 'react-icons/fa6';
import { t } from '../lang/lang.ts';
import { type EvaluateRecipeResult, fridgeEntry, ingredientName } from '../ingredient.ts';
import { type Recipe } from '../store/state.ts';
import { MealTypePills } from './meal-type-pills.tsx';

export interface RecipeModalProps {
  recipe: Recipe;
  ev: EvaluateRecipeResult;
  open: boolean;
  onClose?: () => void;
}

export const RecipeModal = ({ recipe, ev, open, onClose }: RecipeModalProps) => {
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
          {recipe.description && (
            <p className='recipe-modal-desc'>{recipe.description}</p>
          )}
          <div className='rc-ingredients'>
            {recipe.items.map((item) => {
              const fe = fridgeEntry(item.ingredientId);
              const isMissing = !fe.inStock;
              const isWarn = ev.warnList.some(
                (w) => w.ingredientId === item.ingredientId
              );
              return (
                <span
                  key={item.ingredientId}
                  className={`chip readonly ${isMissing ? 'missing' : isWarn ? 'warn' : 'on'}`}
                >
                  <span className='dot'></span>
                  {ingredientName(item.ingredientId)}
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
        </div>
      </div>
    </div>
  );
};
