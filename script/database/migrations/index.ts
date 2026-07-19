import type { Migration } from './types.ts';
import { migration0001IngredientNameToObject } from './0001-ingredient-name-to-object.ts';

// Applied in order, each once (tracked in the "migrations" object store by
// name). Add new ones by appending to this list — never reorder or remove
// past entries, since their names are the migration history.
export const MIGRATIONS: Migration[] = [migration0001IngredientNameToObject];

export type { Migration };
