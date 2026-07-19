import type { IngredientTag } from './store/state.ts';

export type DietaryPresetId =
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'halal'
  | 'kosher'
  | 'no-beef'
  | 'lent';

export type DietaryPreset = {
  id: DietaryPresetId;
  blockTags: IngredientTag[];
};

export const DIETARY_PRESETS: DietaryPreset[] = [
  {
    id: 'vegan',
    blockTags: ['dairy', 'egg', 'meat', 'poultry', 'fish', 'shellfish', 'honey'],
  },
  { id: 'vegetarian', blockTags: ['meat', 'poultry', 'fish', 'shellfish'] },
  { id: 'gluten-free', blockTags: ['gluten'] },
  { id: 'halal', blockTags: ['pork', 'alcohol'] },
  { id: 'kosher', blockTags: ['pork', 'shellfish'] },
  { id: 'no-beef', blockTags: ['beef'] },
  { id: 'lent', blockTags: ['dairy', 'egg', 'meat', 'poultry', 'fish', 'shellfish'] },
];

// A preset is "active" once every one of its tags is already blocked —
// applying it again would be a no-op, so callers use this to hide it.
export function isPresetActive(
  preset: DietaryPreset,
  blockedTags: IngredientTag[]
): boolean {
  return preset.blockTags.every((tag) => blockedTags.includes(tag));
}
