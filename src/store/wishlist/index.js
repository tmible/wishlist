import { subscribe } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import BookItem from './book-item.js';
import CooperateOnItem from './cooperate-on-item.js';
import GetList from './get-list.js';
import RetireFromItem from './retire-from-item.js';

const configure = () => {
  [
    [ Events.Wishlist.GetList, GetList ],
    [ Events.Wishlist.BookItem, BookItem ],
    [ Events.Wishlist.CooperateOnItem, CooperateOnItem ],
    [ Events.Wishlist.RetireFromItem, RetireFromItem ],
  ].forEach(([ event, { eventHandler } ]) => subscribe(event, eventHandler));

  [
    GetList,
    BookItem,
    CooperateOnItem,
    RetireFromItem,
  ].forEach(({ prepare }) => prepare());
};

export default { configure };
