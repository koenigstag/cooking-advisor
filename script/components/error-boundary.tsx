import React from 'react';
import { AppError } from './app-error.tsx';

type Props = {
  children: React.ReactNode;
  title?: string;
  hint?: string;
};
type State = { error: unknown };

// Catches errors thrown while rendering the app tree after a successful
// startup (index.tsx's try/catch only covers migrate()/stateStore.initialize()
// before the first render). Reuses AppError so both failure paths look and
// behave the same, including the "Copy state JSON" debug button.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('Uncaught render error', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <AppError
          error={this.state.error}
          title={this.props.title}
          hint={this.props.hint}
        />
      );
    }
    return this.props.children;
  }
}
