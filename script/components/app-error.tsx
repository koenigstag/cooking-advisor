import React from 'react';
import { LANG_EN_US } from '../lang/en_US.ts';
import { DB_NAME, STORE_NAME, RECORD_KEY } from '../database/index.ts';

// Opens its own fresh connection rather than reusing getDB()/dbInstance —
// this runs from the fallback error state, so it shouldn't assume anything
// upstream is in a working condition.
function readRawAppState(): Promise<unknown> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME);
      req.onsuccess = () => {
        const db = req.result;
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const getReq = tx.objectStore(STORE_NAME).get(RECORD_KEY);
          getReq.onsuccess = () => {
            db.close();
            resolve(getReq.result);
          };
          getReq.onerror = () => {
            db.close();
            resolve(undefined);
          };
        } catch {
          db.close();
          resolve(undefined);
        }
      };
      req.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

export function AppError({ error }: { error: unknown }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const rawState = await readRawAppState();
    const payload = {
      error:
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : String(error),
      rawState,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Could not copy state to clipboard', e);
    }
  };

  return (
    <div className='empty-state'>
      <div className='display'>{LANG_EN_US.appError.title}</div>
      <p>{LANG_EN_US.appError.hint}</p>
      {error instanceof Error && <p>{error.message}</p>}
      <button className='btn secondary' onClick={handleCopy}>
        {copied ? LANG_EN_US.appError.copied : LANG_EN_US.appError.copyStateBtn}
      </button>
    </div>
  );
}
