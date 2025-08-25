import { inject } from '@tmible/wishlist-common/dependency-injector';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import BookItem from './book-item.js';
import CooperateOnItem from './cooperate-on-item.js';
import DeleteItemGroupLink from './delete-item-group-link.js';
import GetItemGroupLink from './get-item-group-link.js';
import GetItemName from './get-item-name.js';
import GetItemParticipants from './get-item-participants.js';
import GetItemState from './get-item-state.js';
import GetList from './get-list.js';
import RetireFromItem from './retire-from-item.js';
import SetItemGroupLink from './set-item-group-link.js';

/** @module Модуль хранилища для работы со списками желаний других пользователей */

/**
 * Настройка модуля хранилища
 * Подписка на [события]{@link Events} и подготовка выражений запроса БД
 * @function configure
 */
const configure = () => {
  const eventBus = inject(InjectionToken.EventBus);

  [
    [ Events.Wishlist.GetList, GetList ],
    [ Events.Wishlist.BookItem, BookItem ],
    [ Events.Wishlist.CooperateOnItem, CooperateOnItem ],
    [ Events.Wishlist.RetireFromItem, RetireFromItem ],
    [ Events.Wishlist.GetWishlistItemName, GetItemName ],
    [ Events.Wishlist.SetWishlistItemGroupLink, SetItemGroupLink ],
    [ Events.Wishlist.GetWishlistItemGroupLink, GetItemGroupLink ],
    [ Events.Wishlist.DeleteWishlistItemGroupLink, DeleteItemGroupLink ],
    [ Events.Wishlist.GetWishlistItemState, GetItemState ],
    [ Events.Wishlist.GetWishlistItemParticipants, GetItemParticipants ],
  ].forEach(([ event, { eventHandler } ]) => eventBus.subscribe(event, eventHandler));

  [
    GetList,
    BookItem,
    CooperateOnItem,
    RetireFromItem,
    GetItemName,
    SetItemGroupLink,
    GetItemGroupLink,
    DeleteItemGroupLink,
    GetItemState,
    GetItemParticipants,
  ].forEach(({ prepare }) => prepare());
};

export default { configure };
