import ReactDOM, { type Root } from 'react-dom/client';

type ReactDOMv18 = typeof ReactDOM & {
  createRoot: never;
  render(children: React.ReactNode, container: HTMLElement): void;
};

type ReactDOMv19 = typeof ReactDOM & {
  createRoot(rootElement: HTMLElement): Root;
  render(children: React.ReactNode): void;
  unmount(): void;
};

const ReactDOM19 = ReactDOM as ReactDOMv19;

// Mimic React 19-like root creating function to support hotswap for both React 18 (umd) and 19 (esm)
export const createReactRoot = (rootElement: HTMLElement): Root => {
  if (typeof ReactDOM19.createRoot === 'function') {
    return ReactDOM19.createRoot(rootElement);
  }

  // For React 18, we need to patch the API

  // Patch the render and unmount methods to match React 19's API
  const renderInternal = (ReactDOM as ReactDOMv18).render;
  ReactDOM19.render = (children: React.ReactNode) => {
    return renderInternal(children, rootElement);
  };

  // Mimic the unmount method to match React 19's API
  ReactDOM19.unmount = () => {
    rootElement.innerHTML = '';
  };

  return ReactDOM19;
};
