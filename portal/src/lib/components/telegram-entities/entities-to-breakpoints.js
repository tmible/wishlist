/** @typedef {import('./parser.svelte').Entity} Entity */
/** @typedef {import('./parser.svelte').Breakpoint} Breakpoint */

/**
 * Отображение элементов разметки в объекты, представляющие точки изменения разметки в тексте
 * @function entitiesToBreakpoints
 * @param {Entity[]} entities Элементы разметки
 * @returns {Breakpoint[]} Точки изменения разметки в тексте
 */
export const entitiesToBreakpoints = (entities) => entities.flatMap((entity) => [
  { offset: entity.offset, entity, type: 'opening' },
  { offset: entity.offset + entity.length, entity, type: 'closing' },
]);
