import { MIGRATIONS } from './index.ts';

export const MIGRATIONS_STORE = 'migrations';

// Reserved key — can't collide with a real migration name since those come
// from the numbered files in this folder (0001-..., 0002-..., etc).
const CHECKPOINT_KEY = '__checkpoint__';

export function ensureMigrationsStore(db: IDBDatabase): void {
  if (!db.objectStoreNames.contains(MIGRATIONS_STORE)) {
    db.createObjectStore(MIGRATIONS_STORE, { keyPath: 'name' });
  }
}

function getRecord<T>(db: IDBDatabase, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MIGRATIONS_STORE, 'readonly');
    const req = tx.objectStore(MIGRATIONS_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAppliedMigrationNames(db: IDBDatabase): Promise<Set<string>> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MIGRATIONS_STORE, 'readonly');
    const req = tx.objectStore(MIGRATIONS_STORE).getAllKeys();
    req.onsuccess = () => resolve(new Set(req.result as string[]));
    req.onerror = () => reject(req.error);
  });
}

function markMigrationApplied(db: IDBDatabase, name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MIGRATIONS_STORE, 'readwrite');
    tx.objectStore(MIGRATIONS_STORE).put({
      name,
      migratedAt: new Date().toISOString(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function setCheckpoint(db: IDBDatabase, lastMigration: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MIGRATIONS_STORE, 'readwrite');
    tx.objectStore(MIGRATIONS_STORE).put({
      name: CHECKPOINT_KEY,
      lastMigration,
      migratedAt: new Date().toISOString(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export type MigrationResult = {
  data: any;
  // True when a migration actually ran this call — the caller must persist
  // `data` back to the appState record, or the checkpoint fast-path below
  // will skip re-migrating this same still-unfixed record next time.
  didMigrate: boolean;
};

// Runs every not-yet-applied migration's up() over the raw persisted state,
// in order, recording each as applied so it never runs twice. A checkpoint
// (name of the newest migration confirmed applied) lets every load after
// the first skip straight past the per-migration scan with a single cheap
// get() — it only falls back to the full check once a migration file gets
// added to MIGRATIONS that the checkpoint doesn't know about yet.
export async function runMigrations(db: IDBDatabase, raw: any): Promise<MigrationResult> {
  if (MIGRATIONS.length === 0) return { data: raw, didMigrate: false };
  const latestName = MIGRATIONS[MIGRATIONS.length - 1].name;

  const checkpoint = await getRecord<{ lastMigration: string }>(db, CHECKPOINT_KEY);
  if (checkpoint?.lastMigration === latestName) return { data: raw, didMigrate: false };

  const applied = await getAppliedMigrationNames(db);
  let data = raw;
  let didMigrate = false;
  for (const migration of MIGRATIONS) {
    if (applied.has(migration.name)) continue;
    data = migration.up(data);
    didMigrate = true;
    await markMigrationApplied(db, migration.name);
  }
  await setCheckpoint(db, latestName);
  return { data, didMigrate };
}
