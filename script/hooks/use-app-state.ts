import React from 'react';
import { stateStore } from '../store/store.ts';

export function useAppState() {
  return React.useSyncExternalStore(stateStore.subscribe, stateStore.getState);
}
