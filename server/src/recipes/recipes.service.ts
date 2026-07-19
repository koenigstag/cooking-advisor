import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { CreateRecipeDto } from './recipe-item.dto';
import { EXAMPLE_RECIPES_SEED } from './example-recipes.seed';
import { LibraryRecipe, SupportedLang } from './recipe.entity';

const DATA_FILE = join(__dirname, '..', '..', 'data', 'recipes.json');

@Injectable()
export class RecipesService {
  private writeQueue: Promise<unknown> = Promise.resolve();
  private ensureSeededPromise: Promise<void> | null = null;

  async findAll(lang?: SupportedLang): Promise<LibraryRecipe[]> {
    await this.ensureSeeded();
    const recipes = await this.readAll();
    if (!lang) return recipes;
    // Recipes without a lang tag (legacy data) are shown regardless of filter.
    return recipes.filter((r) => !r.lang || r.lang === lang);
  }

  async create(dto: CreateRecipeDto): Promise<LibraryRecipe> {
    await this.ensureSeeded();

    const recipe: LibraryRecipe = {
      id: randomUUID(),
      name: dto.name.trim(),
      description: dto.description?.trim() || '',
      items: dto.items.map((item) => ({
        name: item.name.trim(),
        amount: item.amount ?? null,
        unit: item.unit ?? null,
      })),
      mealTypes: dto.mealTypes,
      lang: dto.lang,
      createdAt: new Date().toISOString(),
    };

    await this.enqueueWrite(async () => {
      const recipes = await this.readAll();
      recipes.push(recipe);
      await this.writeAll(recipes);
    });

    return recipe;
  }

  private ensureSeeded(): Promise<void> {
    if (!this.ensureSeededPromise) {
      this.ensureSeededPromise = this.enqueueWrite(async () => {
        try {
          await readFile(DATA_FILE, 'utf-8');
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
          const seeded: LibraryRecipe[] = EXAMPLE_RECIPES_SEED.map((r) => ({
            ...r,
            id: randomUUID(),
            createdAt: new Date().toISOString(),
          }));
          await this.writeAll(seeded);
        }
      });
    }
    return this.ensureSeededPromise;
  }

  private enqueueWrite(fn: () => Promise<void>): Promise<void> {
    const next = this.writeQueue.then(fn, fn);
    this.writeQueue = next.catch(() => undefined);
    return next;
  }

  private async readAll(): Promise<LibraryRecipe[]> {
    try {
      const raw = await readFile(DATA_FILE, 'utf-8');
      return JSON.parse(raw) as LibraryRecipe[];
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw e;
    }
  }

  private async writeAll(recipes: LibraryRecipe[]): Promise<void> {
    await mkdir(dirname(DATA_FILE), { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(recipes, null, 2), 'utf-8');
  }
}
