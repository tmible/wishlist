/** @typedef {import('./parser.svelte').Breakpoint} Breakpoint */

/**
 * Обеспечение отсутствия разметки абзацев в каждом блоке кода. Начала в начале и конца в конце.
 * Функция для использования в {@link Array.prototype.filter}
 * @function filterPreParagraphs
 * @param {Breakpoint} breakpoint Точка изменения разметки в тексте
 * @param {unknown} _ Не используется
 * @param {Breakpoint[]} breakpoints Все точки изменения разметки в тексте
 * @returns {boolean} Признак удовлетворения элемента фильтру
 */
export const filterPreParagraphs = (breakpoint, _, breakpoints) => (
  breakpoint.entity.type !== 'paragraph' ||
    !breakpoints.some(({ offset, entity, type }) => (
      breakpoint.offset === offset &&
        entity.type === 'pre' &&
        breakpoint.type === type
    ))
);
