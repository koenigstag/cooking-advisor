import React from 'react';
import { LANG_EN_US } from '../lang/en_US.ts';

export function IndexedDBUnsupported() {
  return (
    <div className='empty-state'>
      <div className='display'>{LANG_EN_US.indexedDB.unavailable}</div>
      <p>{LANG_EN_US.indexedDB.unsupported}</p>
    </div>
  );
}
