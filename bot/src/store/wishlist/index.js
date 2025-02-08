import { inject } from '@tmible/wishlist-common/dependency-injector';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import BookItem from './book-item.js';
import CooperateOnItem from './cooperate-on-item.js';
import GetList from './get-list.js';
import RetireFromItem from './retire-from-item.js';

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
  ].forEach(([ event, { eventHandler } ]) => eventBus.subscribe(event, eventHandler));

  [
    GetList,
    BookItem,
    CooperateOnItem,
    RetireFromItem,
  ].forEach(({ prepare }) => prepare());
};

export default { configure };
