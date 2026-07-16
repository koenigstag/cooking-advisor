import type { ComponentType, SVGProps } from 'react';

export type IconModule = Record<string, ComponentType<SVGProps<SVGSVGElement>>>;

// Bare specifiers must match an entry in index.html's importmap.
export type IconLib =
  | 'react-icons/fa'
  | 'react-icons/fa6'
  | 'react-icons/md'
  | 'react-icons/bs'
  | 'react-icons/gi'
  | 'react-icons/hi2'
  | 'react-icons/io5'
  | 'react-icons/tb'
  | 'react-icons/pi'
  | 'react-icons/ri'
  | 'react-icons/lu';

// react-icons ships plain named exports (no default export at runtime —
// esModuleInterop just adds a synthetic `default` to the *type*), so the
// dynamically imported module namespace object itself is the icon map.
const asIconModule = (mdl: object) => mdl as unknown as IconModule;

const importers: Record<IconLib, () => Promise<IconModule>> = {
  'react-icons/fa': () => import('react-icons/fa').then(asIconModule),
  'react-icons/fa6': () => import('react-icons/fa6').then(asIconModule),
  'react-icons/md': () => import('react-icons/md').then(asIconModule),
  'react-icons/bs': () => import('react-icons/bs').then(asIconModule),
  'react-icons/gi': () => import('react-icons/gi').then(asIconModule),
  'react-icons/hi2': () => import('react-icons/hi2').then(asIconModule),
  'react-icons/io5': () => import('react-icons/io5').then(asIconModule),
  'react-icons/tb': () => import('react-icons/tb').then(asIconModule),
  'react-icons/pi': () => import('react-icons/pi').then(asIconModule),
  'react-icons/ri': () => import('react-icons/ri').then(asIconModule),
  'react-icons/lu': () => import('react-icons/lu').then(asIconModule),
};

const cache = new Map<IconLib, Promise<IconModule>>();

export function loadIconLib(lib: IconLib): Promise<IconModule> {
  let promise = cache.get(lib);
  if (!promise) {
    promise = importers[lib]();
    cache.set(lib, promise);
  }
  return promise;
}
