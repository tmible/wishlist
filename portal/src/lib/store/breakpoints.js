import { readable } from 'svelte/store';

/**
 * @template T
 * @typedef {import('svelte/store').Readable<T>} Readable
 */

/** @module Набор Svelte хранилищ признаков преодоления текущей шириной экрана различных размеров */

/**
 * Svelte хранилище признака преодоления текущей шириной экрана среднего размера
 * @type {Readable<boolean | null>}
 */
export const md = readable(null, (set) => {
  const mdMediaQuery = window.matchMedia('(min-width: 768px)');
  const handleMdBreakpoint = ({ matches }) => set(matches);
  mdMediaQuery.addEventListener('change', handleMdBreakpoint);
  handleMdBreakpoint(mdMediaQuery);
  return () => mdMediaQuery.removeEventListener('change', handleMdBreakpoint);
});
