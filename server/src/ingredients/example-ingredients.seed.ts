import { Ingredient } from './ingredient.entity';

export type SeedIngredient = Omit<Ingredient, 'id' | 'updatedAt'>;

// Matches the example fridge products previously seeded client-side, so
// clients that fetch this catalog converge on the same ingredient ids.
export const EXAMPLE_INGREDIENTS_SEED: SeedIngredient[] = [
  { name: { ru: 'Яйца', en: 'Eggs' }, iconId: 'egg' },
  { name: { ru: 'Молоко', en: 'Milk' }, iconId: 'milk' },
  { name: { ru: 'Сыр твёрдый', en: 'Hard cheese' }, iconId: 'cheese' },
  { name: { ru: 'Соль', en: 'Salt' } },
  { name: { ru: 'Масло растительное', en: 'Vegetable oil' } },
  { name: { ru: 'Хлеб', en: 'Bread' }, iconId: 'bread' },
  { name: { ru: 'Картофель', en: 'Potato' }, iconId: 'potato' },
  { name: { ru: 'Лук репчатый', en: 'Onion' } },
  { name: { ru: 'Масло сливочное', en: 'Butter' }, iconId: 'butter' },
  { name: { ru: 'Помидоры', en: 'Tomato' }, iconId: 'tomato' },
];
