/** @typedef {import('./parser.svelte').Breakpoint} Breakpoint */

/**
 * Компаратор точек изменения разметки в тексте по положению в тексте (по возрастанию)
 * @function compareByOffset
 * @param {Breakpoint} a Первая сравниваемая точка
 * @param {Breakpoint} b Вторая сравниваемая точка
 * @returns {number | null} Отрицательное число, если a раньше b; положительное, если b раньше a;
 * null, если отступы от начала текста равны
 */
const compareByOffset = (a, b) => (a.offset === b.offset ? null : a.offset - b.offset);

/**
 * Компаратор точек изменения разметки в тексте по типу. Сначала закрывающие, потом открывающие
 * @function compareByType
 * @param {Breakpoint} a Первая сравниваемая точка
 * @param {Breakpoint} b Вторая сравниваемая точка
 * @returns {-1 | 1 | null} -1, если a раньше b; 1, если b раньше a; null, если типы равны
 */
const compareByType = (a, b) => (a.type === b.type ? null : (a.type === 'closing' ? -1 : 1));

/**
 * Компаратор точек изменения разметки в тексте по типу соответсвующей сущности. Приоретизация
 * цитат, блоков кода в первую очередь и абзацев во вторую. Открывающие в прямом порядке
 * приоритетов, закрывающие -- в обратном
 * @function filterPreBlockquotesAndParagraphs
 * @param {Breakpoint} a Первая сравниваемая точка
 * @param {Breakpoint} b Вторая сравниваемая точка
 * @returns {-1 | 1 | null} -1, если a раньше b; 1, если b раньше a; null, если типы равны
 */
const filterPreBlockquotesAndParagraphs = (a, b) => {
  if ([ 'pre', 'blockquote' ].includes(a.entity.type)) {
    return a.type === 'closing' ? 1 : -1;
  }
  if ([ 'pre', 'blockquote' ].includes(b.entity.type)) {
    return b.type === 'closing' ? -1 : 1;
  }
  if (a.entity.type === 'paragraph') {
    return a.type === 'closing' ? 1 : -1;
  }
  if (b.entity.type === 'paragraph') {
    return b.type === 'closing' ? -1 : 1;
  }
  return null;
};

/**
 * Компаратор точек изменения разметки в тексте по длине соответсвующей сущности.
 * Открывающие в порядке убывания длины, закрывающие -- в порядке возрастания
 * @function orderByEntityLength
 * @param {Breakpoint} a Первая сравниваемая точка
 * @param {Breakpoint} b Вторая сравниваемая точка
 * @returns {number} Отрицательное число, если a раньше b; положительное, если b раньше a;
 * 0, если длины равны
 */
const orderByEntityLength = (a, b) => (
  a.type === 'closing' ?
    a.entity.length - b.entity.length :
    b.entity.length - a.entity.length
);

/**
 * Компаратор точек изменения разметки в тексте [по положению в тексте]{@link compareByOffset},
 * [по типу]{@link compareByType},
 * [по типу соответсвующей сущности]{@link filterPreBlockquotesAndParagraphs},
 * [по длине соответсвующей сущности]{@link orderByEntityLength}
 * @function sortBreakpoints
 * @param {Breakpoint} a Первая сравниваемая точка
 * @param {Breakpoint} b Вторая сравниваемая точка
 * @returns {number} Отрицательное число, если a раньше b; положительное, если b раньше a;
 * 0 иначе
 */
export const sortBreakpoints = (a, b) => (
  compareByOffset(a, b) ??
  compareByType(a, b) ??
  filterPreBlockquotesAndParagraphs(a, b) ??
  orderByEntityLength(a, b)
);
