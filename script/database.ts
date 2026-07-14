import { defaultState, type State } from './store/state.ts';
import { stateStore } from './store/store.ts';
import { pick } from './utils.ts';

const DB_NAME = 'ChefFinderDB';
const DB_VERSION = 1;
const STORE_NAME = 'appState';
const RECORD_KEY = 'main';

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
    });

    req.addEventListener('success', () => resolve(req.result));
    req.addEventListener('error', () => reject(req.error));
  });
}

export async function getDB() {
  if (!dbInstance) dbInstance = await openDB();
  return dbInstance;
}

export async function loadData(): Promise<Pick<State, SaveStateKeys>> {
  try {
    const db = await getDB();
    return await new Promise<Pick<State, SaveStateKeys>>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(RECORD_KEY);
      req.onsuccess = () =>
        resolve(pick(req.result || defaultState, saveFields));
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Cannot read IndexedDB', e);
    return defaultState;
  }
}

let saveQueued = false;
export async function saveData(data: State = stateStore.getState()) {
  // fire-and-forget, but coalesce rapid successive calls onto one microtask
  if (saveQueued) return;
  saveQueued = true;
  queueMicrotask(async () => {
    saveQueued = false;
    try {
      const db = await getDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(
          JSON.parse(JSON.stringify(pick(data, saveFields))),
          RECORD_KEY
        );
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error('Cannot save to IndexedDB', e);
    }
  });
}
