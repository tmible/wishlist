/** @typedef {ReturnType<typeof RegExp.prototype.exec>} Match */
/** @typedef {import('./parser.svelte').Breakpoint} Breakpoint */

/**
 * Отображение переводов строк в объекты, представляющие точки
 * изменения разметки в тексте для каждого перевода строки
 * @function flatMapLineBreaks
 * @param {Match[]} lineBreaks Объекты нахождения переводов строк с помощью регулярного выражения
 * @param {number} textLength Длина всего текста
 * @returns {Breakpoint[]} Точки изменения разметки в тексте
 */
const flatMapLineBreaks = (lineBreaks, textLength) => lineBreaks.flatMap(({ index }, i) => [{
  offset: index,
  entity: {
    type: 'paragraph',
    length: index - (i > 0 ? lineBreaks[i - 1].index + 1 : 0),
  },
  type: 'closing',
}, {
  offset: index,
  entity: {
    type: 'paragraph',
    length: 1,
  },
  type: 'opening',
}, {
  offset: index + 1,
  entity: {
    type: 'paragraph',
    length: 1,
  },
  type: 'closing',
}, {
  offset: index + 1,
  entity: {
    type: 'paragraph',
    length: (
      i < lineBreaks.length - 1 ? lineBreaks[i + 1].index + 1 : textLength
    ) - (index + 1),
  },
  type: 'opening',
}]);

/**
 * Отображение переводов строк в объекты, представляющие точки изменения
 * разметки в тексте. В частности начала и концы абзацев
 * @function lineBreaksToBreakpoints
 * @param {Match[]} lineBreaks Объекты нахождения переводов строк с помощью регулярного выражения
 * @param {number} textLength Длина всего текста
 * @returns {Breakpoint[]} Точки изменения разметки в тексте
 */
export const lineBreaksToBreakpoints = (lineBreaks, textLength) => [
  ...(
    textLength > 0 ?
      [{
        offset: 0,
        entity: {
          type: 'paragraph',
          length: lineBreaks.length > 0 ? lineBreaks[0].index + 1 : textLength,
        },
        type: 'opening',
      }] :
      []
  ),
  ...flatMapLineBreaks(lineBreaks, textLength),
  ...(
    textLength > 0 ?
      [{
        offset: textLength,
        entity: {
          type: 'paragraph',
          length: textLength - (lineBreaks.length > 0 ? lineBreaks.at(-1).index + 1 : 0),
        },
        type: 'closing',
      }] :
      []
  ),
];
