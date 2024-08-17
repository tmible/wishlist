import numericEnum from '@tmible/wishlist-bot/utils/numeric-enum';

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
