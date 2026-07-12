export type Unit =
  | 'gram'
  | 'kilogram'
  | 'milliliter'
  | 'liter'
  | 'piece'
  | 'tablespoon'
  | 'teaspoon'
  | 'fortaste'
  | 'ounce'
  | 'fluidOunce'
  | 'pound'
  | 'pint'
  | 'quart'
  | 'gallon'
  | 'cup'
  | 'dash'
  | 'pinch';

export const units = [
  'gram',
  'kilogram',
  'milliliter',
  'liter',
  'piece',
  'tablespoon',
  'teaspoon',
  'fortaste',
] as const satisfies Unit[];
