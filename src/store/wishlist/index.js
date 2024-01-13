import { subscribe } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import bookItem from './book-item.js';
import cooperateOnItem from './cooperate-on-item.js';
import getList from './get-list.js';
import getItemState from './get-item-state.js';
import retireFromItem from './retire-from-item.js';

[
  [ Events.Wishlist.GetList, getList ],
  [ Events.Wishlist.GetItemState, getItemState ],
  [ Events.Wishlist.BookItem, bookItem ],
  [ Events.Wishlist.CooperateOnItem, cooperateOnItem ],
  [ Events.Wishlist.RetireFromItem, retireFromItem ],
].forEach(([ event, handler ]) => subscribe(event, handler));
