import { saveData } from './database.ts';
import { getOrCreateIngredient } from './ingredient.ts';
import { guessIconId } from './icons/icon-map.ts';
import { t, type LANG } from './lang/lang.ts';
import type { Unit } from './options.ts';
import type { Recipe, RecipeItem } from './store/state.ts';
import { stateStore } from './store/store.ts';
import { uid } from './utils.ts';

type LocalizedText = Record<LANG, string>;

type ExampleItem = {
  ingredient: LocalizedText;
  amount: number | null;
  unit: Unit | null;
};

type ExampleRecipe = {
  name: LocalizedText;
  description: LocalizedText;
  items: ExampleItem[];
};

const eggs: LocalizedText = { ru: 'Яйца', en: 'Eggs' };
const milk: LocalizedText = { ru: 'Молоко', en: 'Milk' };
const hardCheese: LocalizedText = { ru: 'Сыр твёрдый', en: 'Hard cheese' };
const salt: LocalizedText = { ru: 'Соль', en: 'Salt' };
const vegetableOil: LocalizedText = {
  ru: 'Масло растительное',
  en: 'Vegetable oil',
};
const bread: LocalizedText = { ru: 'Хлеб', en: 'Bread' };
const potato: LocalizedText = { ru: 'Картофель', en: 'Potato' };
const onion: LocalizedText = { ru: 'Лук репчатый', en: 'Onion' };
const butter: LocalizedText = { ru: 'Масло сливочное', en: 'Butter' };
const tomato: LocalizedText = { ru: 'Помидоры', en: 'Tomato' };
const pasta: LocalizedText = { ru: 'Макароны', en: 'Pasta' };
const bacon: LocalizedText = { ru: 'Бекон', en: 'Bacon' };
const parmesan: LocalizedText = { ru: 'Сыр пармезан', en: 'Parmesan cheese' };
const blackPepper: LocalizedText = { ru: 'Чёрный перец', en: 'Black pepper' };
const cucumber: LocalizedText = { ru: 'Огурцы', en: 'Cucumber' };
const feta: LocalizedText = { ru: 'Сыр фета', en: 'Feta cheese' };
const olives: LocalizedText = { ru: 'Оливки', en: 'Olives' };
const redOnion: LocalizedText = { ru: 'Лук красный', en: 'Red onion' };
const oliveOil: LocalizedText = { ru: 'Оливковое масло', en: 'Olive oil' };

const EXAMPLE_RECIPES: ExampleRecipe[] = [
  {
    name: { ru: 'Омлет с сыром', en: 'Cheese Omelette' },
    description: {
      ru: 'Быстрый и сытный завтрак за 10 минут.',
      en: 'A quick and hearty breakfast in 10 minutes.',
    },
    items: [
      { ingredient: eggs, amount: 3, unit: 'piece' },
      { ingredient: milk, amount: 50, unit: 'milliliter' },
      { ingredient: hardCheese, amount: 50, unit: 'gram' },
      { ingredient: salt, amount: null, unit: 'fortaste' },
      { ingredient: vegetableOil, amount: 1, unit: 'tablespoon' },
    ],
  },
  {
    name: { ru: 'Паста Карбонара', en: 'Pasta Carbonara' },
    description: {
      ru: 'Классическая итальянская паста с беконом и сыром.',
      en: 'Classic Italian pasta with bacon and cheese.',
    },
    items: [
      { ingredient: pasta, amount: 200, unit: 'gram' },
      { ingredient: bacon, amount: 100, unit: 'gram' },
      { ingredient: eggs, amount: 2, unit: 'piece' },
      { ingredient: parmesan, amount: 50, unit: 'gram' },
      { ingredient: blackPepper, amount: null, unit: 'fortaste' },
    ],
  },
  {
    name: { ru: 'Греческий салат', en: 'Greek Salad' },
    description: {
      ru: 'Лёгкий летний салат со свежими овощами и сыром фета.',
      en: 'A light summer salad with fresh vegetables and feta cheese.',
    },
    items: [
      { ingredient: cucumber, amount: 2, unit: 'piece' },
      { ingredient: tomato, amount: 2, unit: 'piece' },
      { ingredient: feta, amount: 100, unit: 'gram' },
      { ingredient: olives, amount: 50, unit: 'gram' },
      { ingredient: redOnion, amount: 1, unit: 'piece' },
      { ingredient: oliveOil, amount: 2, unit: 'tablespoon' },
    ],
  },
  {
    name: { ru: 'Жареная картошка с луком', en: 'Fried Potatoes with Onion' },
    description: {
      ru: 'Простое и любимое многими блюдо на каждый день.',
      en: 'A simple everyday favorite.',
    },
    items: [
      { ingredient: potato, amount: 500, unit: 'gram' },
      { ingredient: onion, amount: 1, unit: 'piece' },
      { ingredient: vegetableOil, amount: 3, unit: 'tablespoon' },
      { ingredient: salt, amount: null, unit: 'fortaste' },
    ],
  },
  {
    name: {
      ru: 'Бутерброд с сыром и помидором',
      en: 'Cheese and Tomato Sandwich',
    },
    description: {
      ru: 'Быстрый перекус за пару минут.',
      en: 'A quick snack in a couple of minutes.',
    },
    items: [
      { ingredient: bread, amount: 2, unit: 'piece' },
      { ingredient: hardCheese, amount: 50, unit: 'gram' },
      { ingredient: tomato, amount: 1, unit: 'piece' },
      { ingredient: butter, amount: 10, unit: 'gram' },
    ],
  },
];

const EXAMPLE_FRIDGE: ExampleItem[] = [
  { ingredient: eggs, amount: 6, unit: 'piece' },
  { ingredient: milk, amount: 500, unit: 'milliliter' },
  { ingredient: hardCheese, amount: 200, unit: 'gram' },
  { ingredient: salt, amount: null, unit: null },
  { ingredient: vegetableOil, amount: 1, unit: 'liter' },
  { ingredient: bread, amount: 1, unit: 'piece' },
  { ingredient: potato, amount: 1, unit: 'kilogram' },
  { ingredient: onion, amount: 5, unit: 'piece' },
  { ingredient: butter, amount: 200, unit: 'gram' },
  { ingredient: tomato, amount: 3, unit: 'piece' },
];

export async function loadExampleData(
  lang: LANG
): Promise<{ addedRecipes: number; skippedRecipes: number }> {
  const existingNames = new Set(
    stateStore.getState().recipes.map((r) => r.name.trim().toLowerCase())
  );

  const newRecipes: Recipe[] = [];
  EXAMPLE_RECIPES.forEach((r) => {
    const name = r.name[lang];
    if (existingNames.has(name.trim().toLowerCase())) return;

    const items: RecipeItem[] = r.items.map((it) => {
      const ingName = it.ingredient[lang];
      const ing = getOrCreateIngredient(ingName, guessIconId(ingName))!;
      return {
        ingredientId: ing.id,
        name: ing.name,
        amount: it.amount,
        unit: it.unit ? t(`units.${it.unit}`) : null,
      };
    });

    newRecipes.push({
      id: uid(),
      name,
      description: r.description[lang],
      items,
    });
  });

  if (newRecipes.length) {
    stateStore.setRecipes([...stateStore.getState().recipes, ...newRecipes]);
  }

  EXAMPLE_FRIDGE.forEach((it) => {
    const ingName = it.ingredient[lang];
    const ing = getOrCreateIngredient(ingName, guessIconId(ingName));
    if (!ing) return;
    const existing = stateStore.getState().fridge[ing.id];
    if (existing?.inStock) return;

    stateStore.setFridgeEntry(ing.id, {
      inStock: true,
      amount: it.amount,
      unit: it.unit ? t(`units.${it.unit}`) : null,
    });
  });

  await saveData();

  return {
    addedRecipes: newRecipes.length,
    skippedRecipes: EXAMPLE_RECIPES.length - newRecipes.length,
  };
}
