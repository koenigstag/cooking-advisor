export type { SupportedLang } from '../common/lang';
import type { SupportedLang } from '../common/lang';

export type LibraryRecipeItem = {
  name: string;
  amount: number | null;
  unit: string | null;
};

export type LibraryRecipe = {
  id: string;
  name: string;
  description: string;
  items: LibraryRecipeItem[];
  mealTypes?: string[];
  lang?: SupportedLang;
  createdAt: string;
};
