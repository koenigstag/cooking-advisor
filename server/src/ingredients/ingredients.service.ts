import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { EXAMPLE_INGREDIENTS_SEED } from './example-ingredients.seed';
import { Ingredient } from './ingredient.entity';

const DATA_FILE = join(__dirname, '..', '..', 'data', 'ingredients.json');

@Injectable()
export class IngredientsService {
  private writeQueue: Promise<unknown> = Promise.resolve();
  private ensureSeededPromise: Promise<void> | null = null;

  async findAll(): Promise<Ingredient[]> {
    await this.ensureSeeded();
    return this.readAll();
  }

  private ensureSeeded(): Promise<void> {
    if (!this.ensureSeededPromise) {
      this.ensureSeededPromise = this.enqueueWrite(async () => {
        try {
          await readFile(DATA_FILE, 'utf-8');
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
          const now = new Date().toISOString();
          const seeded: Ingredient[] = EXAMPLE_INGREDIENTS_SEED.map((i) => ({
            ...i,
            id: randomUUID(),
            updatedAt: now,
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

  private async readAll(): Promise<Ingredient[]> {
    try {
      const raw = await readFile(DATA_FILE, 'utf-8');
      return JSON.parse(raw) as Ingredient[];
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw e;
    }
  }

  private async writeAll(ingredients: Ingredient[]): Promise<void> {
    await mkdir(dirname(DATA_FILE), { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(ingredients, null, 2), 'utf-8');
  }
}
