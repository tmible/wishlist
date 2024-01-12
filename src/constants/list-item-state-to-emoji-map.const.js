import { ListItemState } from './list-item-state.const.js';

export const ListItemStateToEmojiMap = new Map([
  [ ListItemState.FREE, '🟢' ],
  [ ListItemState.COOPERATIVE, '🟡' ],
  [ ListItemState.BOOKED, '🔴' ],
]);
