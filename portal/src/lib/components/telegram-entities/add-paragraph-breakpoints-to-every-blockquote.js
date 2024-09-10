/** @typedef {import('./parser.svelte').Breakpoint} Breakpoint */

// eslint-disable-next-line no-secrets/no-secrets -- Просто длинное название
/**
 * Обеспечение наличия разметки абзацев в каждой цитате. Начала в начале и конца в конце.
 * Функция для использования в {@link Array.prototype.flatMap}
 * @function addParagraphBreakpointsToEveryBlockquote
 * @param {Breakpoint} breakpoint Точка изменения разметки в тексте
 * @param {unknown} _ Не используется
 * @param {Breakpoint[]} breakpoints Все точки изменения разметки в тексте
 * @returns {Breakpoint[]} Точки изменения разметки в тексте
 */
export const addParagraphBreakpointsToEveryBlockquote = (breakpoint, _, breakpoints) => [
  breakpoint,
  ...(
    breakpoint.entity.type === 'blockquote' &&
    !breakpoints.some(
      ({ offset, entity, type }) => (
        breakpoint.offset === offset &&
        entity.type === 'paragraph' &&
        breakpoint.type === type
      ),
    ) ?
      [{
        offset: breakpoint.offset,
        entity: {
          type: 'paragraph',
          length: breakpoint.length,
        },
        type: breakpoint.type,
      }] :
      []
  ),
];
