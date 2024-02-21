/* eslint-disable import/no-cycle -- Временно, пока нет сервиса инъекции зависимостей */
import { subscribe } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import BookItem from './book-item.js';
import CooperateOnItem from './cooperate-on-item.js';
import GetList from './get-list.js';
import RetireFromItem from './retire-from-item.js';

/* eslint-enable import/no-cycle */

/** @module Модуль хранилища для работы со списками желаний других пользователей */

/**
 * Настройка модуля хранилища
 * [Подписка]{@link subscribe} на [события]{@link Events} и подготовка выражений запроса БД
 * @function configure
 */
const configure = () => {
  [
    [ Events.Wishlist.GetList, GetList ],
    [ Events.Wishlist.BookItem, BookItem ],
    [ Events.Wishlist.CooperateOnItem, CooperateOnItem ],
    [ Events.Wishlist.RetireFromItem, RetireFromItem ],
  /* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
    Пробел нужен для консистентности с другими элементами массива
  */
  ].forEach(([ event, { eventHandler } ]) => subscribe(event, eventHandler));

  [
    GetList,
    BookItem,
    CooperateOnItem,
    RetireFromItem,
  ].forEach(({ prepare }) => prepare());
};

export default { configure };
