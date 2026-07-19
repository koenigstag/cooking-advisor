import { SupportedLang } from '../common/lang';

export type IngredientName = Partial<Record<SupportedLang, string>>;

export type IngredientTag =
  | 'dairy'
  | 'egg'
  | 'gluten'
  | 'vegetable'
  | 'meat'
  | 'pork'
  | 'beef'
  | 'poultry'
  | 'fish'
  | 'shellfish'
  | 'nuts'
  | 'peanut'
  | 'soy'
  | 'sesame'
  | 'alcohol'
  | 'honey'
  | 'citrus';

export type Ingredient = {
  id: string;
  name: IngredientName;
  iconId?: string;
  tags?: IngredientTag[];
  updatedAt: string;
};
