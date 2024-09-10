import numericEnum from '../numeric-enum.js';

/**
 * Перечисление состояний подарков как элементов списка
 * @enum {number}
 */
const ListItemState = numericEnum([
  'FREE',
  'COOPERATIVE',
  'BOOKED',
]);

export default ListItemState;
