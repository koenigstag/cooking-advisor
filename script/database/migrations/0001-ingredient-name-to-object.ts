import type { Migration } from './types.ts';

// Ingredient.name used to be a plain string before the bilingual {ru, en}
// refactor. Records saved by an older build still have that shape in
// IndexedDB, and ingredientDisplayName() can't read a name out of them
// (name[lang]/.en/.ru are all undefined on a string), so they'd render
// blank forever. The ingredient was originally created under whatever
// language the app was set to at the time (getOrCreateIngredient uses the
// current lang), which is exactly raw.lang on this same record — so attach
// the legacy string to that one language rather than guessing both.
// ingredientDisplayName()'s name.en ?? name.ru fallback still covers
// displaying it correctly under the other language.
export const migration0001IngredientNameToObject: Migration = {
  name: '0001-ingredient-name-to-object',
  up(raw) {
    if (raw && Array.isArray(raw.ingredients)) {
      const lang: 'ru' | 'en' = raw.lang === 'ru' ? 'ru' : 'en';
      raw.ingredients = raw.ingredients.map((ing: any) =>
        ing && typeof ing.name === 'string'
          ? { ...ing, name: { [lang]: ing.name } }
          : ing
      );
    }
    return raw;
  },
};
