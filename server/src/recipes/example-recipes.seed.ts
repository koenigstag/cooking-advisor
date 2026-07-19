import { LibraryRecipe } from './recipe.entity';

export type SeedRecipe = Omit<LibraryRecipe, 'id' | 'createdAt'>;

export const EXAMPLE_RECIPES_SEED: SeedRecipe[] = [
  // Russian
  {
    name: 'Омлет с сыром',
    description: 'Быстрый и сытный завтрак за 10 минут.',
    items: [
      { name: 'Яйца', amount: 3, unit: 'шт.' },
      { name: 'Молоко', amount: 50, unit: 'мл' },
      { name: 'Сыр твёрдый', amount: 50, unit: 'г' },
      { name: 'Соль', amount: null, unit: 'по вкусу' },
      { name: 'Масло растительное', amount: 1, unit: 'ст. л.' },
    ],
    mealTypes: ['breakfast'],
  },
  {
    name: 'Паста Карбонара',
    description: 'Классическая итальянская паста с беконом и сыром.',
    items: [
      { name: 'Макароны', amount: 200, unit: 'г' },
      { name: 'Бекон', amount: 100, unit: 'г' },
      { name: 'Яйца', amount: 2, unit: 'шт.' },
      { name: 'Сыр пармезан', amount: 50, unit: 'г' },
      { name: 'Чёрный перец', amount: null, unit: 'по вкусу' },
    ],
    mealTypes: ['lunch', 'dinner'],
  },
  {
    name: 'Греческий салат',
    description: 'Лёгкий летний салат со свежими овощами и сыром фета.',
    items: [
      { name: 'Огурцы', amount: 2, unit: 'шт.' },
      { name: 'Помидоры', amount: 2, unit: 'шт.' },
      { name: 'Сыр фета', amount: 100, unit: 'г' },
      { name: 'Оливки', amount: 50, unit: 'г' },
      { name: 'Лук красный', amount: 1, unit: 'шт.' },
      { name: 'Оливковое масло', amount: 2, unit: 'ст. л.' },
    ],
    mealTypes: ['lunch', 'dinner'],
  },
  {
    name: 'Жареная картошка с луком',
    description: 'Простое и любимое многими блюдо на каждый день.',
    items: [
      { name: 'Картофель', amount: 500, unit: 'г' },
      { name: 'Лук репчатый', amount: 1, unit: 'шт.' },
      { name: 'Масло растительное', amount: 3, unit: 'ст. л.' },
      { name: 'Соль', amount: null, unit: 'по вкусу' },
    ],
    mealTypes: ['lunch', 'dinner'],
  },
  {
    name: 'Бутерброд с сыром и помидором',
    description: 'Быстрый перекус за пару минут.',
    items: [
      { name: 'Хлеб', amount: 2, unit: 'шт.' },
      { name: 'Сыр твёрдый', amount: 50, unit: 'г' },
      { name: 'Помидоры', amount: 1, unit: 'шт.' },
      { name: 'Масло сливочное', amount: 10, unit: 'г' },
    ],
    mealTypes: ['snack'],
  },
  // English
  {
    name: 'Cheese Omelette',
    description: 'A quick and hearty breakfast in 10 minutes.',
    items: [
      { name: 'Eggs', amount: 3, unit: 'pc' },
      { name: 'Milk', amount: 50, unit: 'ml' },
      { name: 'Hard cheese', amount: 50, unit: 'g' },
      { name: 'Salt', amount: null, unit: 'to taste' },
      { name: 'Vegetable oil', amount: 1, unit: 'tbsp' },
    ],
    mealTypes: ['breakfast'],
  },
  {
    name: 'Pasta Carbonara',
    description: 'Classic Italian pasta with bacon and cheese.',
    items: [
      { name: 'Pasta', amount: 200, unit: 'g' },
      { name: 'Bacon', amount: 100, unit: 'g' },
      { name: 'Eggs', amount: 2, unit: 'pc' },
      { name: 'Parmesan cheese', amount: 50, unit: 'g' },
      { name: 'Black pepper', amount: null, unit: 'to taste' },
    ],
    mealTypes: ['lunch', 'dinner'],
  },
  {
    name: 'Greek Salad',
    description: 'A light summer salad with fresh vegetables and feta cheese.',
    items: [
      { name: 'Cucumber', amount: 2, unit: 'pc' },
      { name: 'Tomato', amount: 2, unit: 'pc' },
      { name: 'Feta cheese', amount: 100, unit: 'g' },
      { name: 'Olives', amount: 50, unit: 'g' },
      { name: 'Red onion', amount: 1, unit: 'pc' },
      { name: 'Olive oil', amount: 2, unit: 'tbsp' },
    ],
    mealTypes: ['lunch', 'dinner'],
  },
  {
    name: 'Fried Potatoes with Onion',
    description: 'A simple everyday favorite.',
    items: [
      { name: 'Potato', amount: 500, unit: 'g' },
      { name: 'Onion', amount: 1, unit: 'pc' },
      { name: 'Vegetable oil', amount: 3, unit: 'tbsp' },
      { name: 'Salt', amount: null, unit: 'to taste' },
    ],
    mealTypes: ['lunch', 'dinner'],
  },
  {
    name: 'Cheese and Tomato Sandwich',
    description: 'A quick snack in a couple of minutes.',
    items: [
      { name: 'Bread', amount: 2, unit: 'pc' },
      { name: 'Hard cheese', amount: 50, unit: 'g' },
      { name: 'Tomato', amount: 1, unit: 'pc' },
      { name: 'Butter', amount: 10, unit: 'g' },
    ],
    mealTypes: ['snack'],
  },
];
