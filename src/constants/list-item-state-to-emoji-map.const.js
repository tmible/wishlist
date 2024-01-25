import ListItemState from './list-item-state.const.js';

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
