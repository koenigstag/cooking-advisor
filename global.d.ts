import type { State } from './script/state';

declare global {
  interface Window {
    state: State;
    render: () => void;
  }
}
