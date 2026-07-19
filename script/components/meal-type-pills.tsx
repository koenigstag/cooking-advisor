import React from 'react';
import { t } from '../lang/lang.ts';
import { type MealType } from '../store/state.ts';

const MEAL_TYPE_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MealTypePills = ({
  mealTypes,
}: {
  mealTypes: MealType[] | undefined;
}) => {
  if (!mealTypes || mealTypes.length === 0) return null;

  const ordered = MEAL_TYPE_ORDER.filter((mt) => mealTypes.includes(mt));

  return (
    <div className='mt-pills'>
      {ordered.map((mt) => (
        <span key={mt} className={`mt-pill mt-${mt}`}>
          <span className='dot'></span>
          {t(`mealTypes.${mt}`)}
        </span>
      ))}
    </div>
  );
};
