import { Ingredient } from './ingredient.entity';

export type SeedIngredient = Omit<Ingredient, 'id' | 'updatedAt'>;

// Matches the example fridge products previously seeded client-side, so
// clients that fetch this catalog converge on the same ingredient ids.
export const EXAMPLE_INGREDIENTS_SEED: SeedIngredient[] = [
  { name: { ru: 'Яйца', en: 'Eggs' }, iconId: 'egg', tags: ['egg'] },
  { name: { ru: 'Молоко', en: 'Milk' }, iconId: 'milk', tags: ['dairy'] },
  {
    name: { ru: 'Сыр твёрдый', en: 'Hard cheese' },
    iconId: 'cheese',
    tags: ['dairy'],
  },
  { name: { ru: 'Соль', en: 'Salt' } },
  { name: { ru: 'Масло растительное', en: 'Vegetable oil' } },
  { name: { ru: 'Хлеб', en: 'Bread' }, iconId: 'bread', tags: ['gluten'] },
  {
    name: { ru: 'Картофель', en: 'Potato' },
    iconId: 'potato',
    tags: ['vegetable'],
  },
  { name: { ru: 'Лук репчатый', en: 'Onion' }, tags: ['vegetable'] },
  {
    name: { ru: 'Масло сливочное', en: 'Butter' },
    iconId: 'butter',
    tags: ['dairy'],
  },
  { name: { ru: 'Помидоры', en: 'Tomato' }, iconId: 'tomato', tags: ['vegetable'] },
];
