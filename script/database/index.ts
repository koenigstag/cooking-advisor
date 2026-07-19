import { defaultState, type State } from '../store/state.ts';
import { pick } from '../utils.ts';
import { ensureMigrationsStore, runMigrations } from './migrations/runner.ts';

export const DB_NAME = 'ChefFinderDB';
const DB_VERSION = 2; // bumped to add the "migrations" object store
export const STORE_NAME = 'appState';
export const RECORD_KEY = 'main';

let dbInstance: IDBDatabase;

const saveFields = Object.keys(defaultState) as SaveStateKeys[];
type SaveStateKeys = keyof typeof defaultState;

export function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.addEventListener('upgradeneeded', (e: IDBVersionChangeEvent) => {
      const db = (e?.target as IDBOpenDBRequest)?.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      ensureMigrationsStore(db);
    });

    req.addEventListener('success', () => resolve(req.result));
    req.addEventListener('error', () => reject(req.error));
  });
}

export async function getDB() {
  if (!dbInstance) dbInstance = await openDB();
  return dbInstance;
}

function getRaw(db: IDBDatabase): Promise<any> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(RECORD_KEY);
    req.onsuccess = () => resolve(req.result || defaultState);
    req.onerror = () => reject(req.error);
  });
}

function putRaw(db: IDBDatabase, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, RECORD_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Runs any pending migrations over the persisted record and, if any ran,
// writes the fixed record back — awaited, not the fire-and-forget
// saveData() below, since loadData() does its own separate read right
// after this and must see the already-migrated record, not a stale one
// still in flight. Call this once at startup, before stateStore.initialize().
//
// Deliberately doesn't catch its own errors: a failed migration means the
// persisted data can't be trusted, so the caller must treat that as fatal
// and keep the app from starting rather than silently continuing on
// possibly-corrupt state.
export async function migrate(): Promise<void> {
  const db = await getDB();
  const raw = await getRaw(db);
  const { data: migrated, didMigrate } = await runMigrations(db, raw);
  if (didMigrate) {
    await putRaw(db, migrated);
  }
}

export async function loadData(): Promise<Pick<State, SaveStateKeys>> {
  try {
    const db = await getDB();
    const raw = await getRaw(db);
    return pick(raw, saveFields);
  } catch (e) {
    console.warn('Cannot read IndexedDB', e);
    return defaultState;
  }
}

let saveQueued = false;
export async function saveData(
  data: State = window.__appState()
): Promise<void> {
  // fire-and-forget, but coalesce rapid successive calls onto one microtask
  if (saveQueued) return;
  saveQueued = true;
  queueMicrotask(async () => {
    saveQueued = false;
    try {
      const db = await getDB();
      await putRaw(db, JSON.parse(JSON.stringify(pick(data, saveFields))));
    } catch (e) {
      console.error('Cannot save to IndexedDB', e);
    }
  });
}
