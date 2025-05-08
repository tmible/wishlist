import ListItemState from './constants/list-item-state.const.js';

/**
 * Подмножество состояний элемента списка, обозначающих наличие намерения подарить его
 * @constant {Set<ListItemState>}
 */
const PLANNED_PRESENTS_STATES = new Set([ ListItemState.BOOKED, ListItemState.COOPERATIVE ]);

/**
 * Компаратор подарков в списке желаний для определения порядка их появления в быстрой очистке
 * @typedef {{ isExternal: 0 | 1, state: ListItemState, id: number }} WishlistItem
 * @function clearWishlistItemsComparator
 * @param {WishlistItem} a Подарок из списка желаний
 * @param {WishlistItem} b Подарок из списка желаний
 * @returns {number} отрицательное число — a меньше b, положительное — b меньше а, 0 — a и b равны
 */
const clearWishlistItemsComparator = (a, b) => {
  const isAPlanned = PLANNED_PRESENTS_STATES.has(a.state) ? 1 : 0;
  const isBPlanned = PLANNED_PRESENTS_STATES.has(b.state) ? 1 : 0;

  if (a.isExternal !== b.isExternal) {
    return b.isExternal - a.isExternal;
  }

  if (isAPlanned !== isBPlanned) {
    return isBPlanned - isAPlanned;
  }

  return a.id - b.id;
};

export default clearWishlistItemsComparator;
