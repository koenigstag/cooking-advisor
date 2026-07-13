import type { State } from './script/store/state';

declare global {
  interface Window {
    state: State;
    render: () => void;
    __appState: () => State;
  }
}
