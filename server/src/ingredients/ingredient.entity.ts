import { SupportedLang } from '../common/lang';

export type IngredientName = Partial<Record<SupportedLang, string>>;

export type Ingredient = {
  id: string;
  name: IngredientName;
  iconId?: string;
  updatedAt: string;
};
