import { saveData } from './database.ts';
import { getOrCreateIngredient } from './ingredient.ts';
import { guessIconId } from './icons/icon-map.ts';
import { t, type LANG } from './lang/lang.ts';
import type { Unit } from './options.ts';
import { stateStore } from './store/store.ts';

type LocalizedText = Record<LANG, string>;

type ExampleItem = {
  ingredient: LocalizedText;
  amount: number | null;
  unit: Unit | null;
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
): Promise<{ addedProducts: number }> {
  let addedProducts = 0;

  EXAMPLE_FRIDGE.forEach((it) => {
    const ingName = it.ingredient[lang];
    const ing = getOrCreateIngredient(ingName, guessIconId(ingName));
    if (!ing) return;
    const existing = stateStore.getState().fridge[ing.id];
    if (existing?.inStock) return;

    addedProducts++;
    stateStore.setFridgeEntry(ing.id, {
      inStock: true,
      amount: it.amount,
      unit: it.unit ? t(`units.${it.unit}`) : null,
    });
  });

  await saveData();

  return { addedProducts };
}
