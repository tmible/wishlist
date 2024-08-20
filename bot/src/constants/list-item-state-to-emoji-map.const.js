import ListItemState from '@tmible/wishlist-bot/constants/list-item-state';

/**
 * Отображение состояний подарков как элементов списка в эмодзи
 * @constant {Map<ListItemState, string>}
 */
const ListItemStateToEmojiMap = new Map([
  [ ListItemState.FREE, '🟢' ],
  [ ListItemState.COOPERATIVE, '🟡' ],
  [ ListItemState.BOOKED, '🔴' ],
]);

export default ListItemStateToEmojiMap;
