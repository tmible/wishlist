/* eslint-disable import/no-cycle -- Временно, пока нет сервиса инъекции зависимостей */
import { subscribe } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import GetUseridAndUsernameIfPresent from './get-userid-and-username-if-present.js';
import GetUseridByUsername from './get-userid-by-username.js';
import GetUsernameByUserid from './get-username-by-userid.js';
import StoreUsername from './store-username.js';

/* eslint-enable import/no-cycle */

/**
 * @module Модуль хранилища для работы с идентификаторами
 * и именами пользователей и их соответствием
 */

/**
 * Настройка модуля хранилища
 * [Подписка]{@link subscribe} на [события]{@link Events} и подготовка выражений запроса БД
 * @function configure
 */
const configure = () => {
  [
    [ Events.Usernames.GetUseridByUsername, GetUseridByUsername ],
    [ Events.Usernames.GetUsernameByUserid, GetUsernameByUserid ],
    [ Events.Usernames.GetUseridAndUsernameIfPresent, GetUseridAndUsernameIfPresent ],
    [ Events.Usernames.StoreUsername, StoreUsername ],
  /* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
    Пробел нужен для консистентности с другими элементами массива
  */
  ].forEach(([ event, { eventHandler } ]) => subscribe(event, eventHandler));

  [
    GetUseridByUsername,
    GetUsernameByUserid,
    GetUseridAndUsernameIfPresent,
    StoreUsername,
  ].forEach(({ prepare }) => prepare());
};

export default { configure };
