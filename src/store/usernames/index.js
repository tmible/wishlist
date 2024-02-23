import { inject } from '@tmible/wishlist-bot/architecture/dependency-injector';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import GetUseridAndUsernameIfPresent from './get-userid-and-username-if-present.js';
import GetUseridByUsername from './get-userid-by-username.js';
import GetUsernameByUserid from './get-username-by-userid.js';
import StoreUsername from './store-username.js';

/**
 * @module Модуль хранилища для работы с идентификаторами
 * и именами пользователей и их соответствием
 */

/**
 * Настройка модуля хранилища
 * Подписка на [события]{@link Events} и подготовка выражений запроса БД
 * @function configure
 */
const configure = () => {
  const eventBus = inject(InjectionToken.EventBus);

  [
    [ Events.Usernames.GetUseridByUsername, GetUseridByUsername ],
    [ Events.Usernames.GetUsernameByUserid, GetUsernameByUserid ],
    [ Events.Usernames.GetUseridAndUsernameIfPresent, GetUseridAndUsernameIfPresent ],
    [ Events.Usernames.StoreUsername, StoreUsername ],
  /* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
    Пробел нужен для консистентности с другими элементами массива
  */
  ].forEach(([ event, { eventHandler } ]) => eventBus.subscribe(event, eventHandler));

  [
    GetUseridByUsername,
    GetUsernameByUserid,
    GetUseridAndUsernameIfPresent,
    StoreUsername,
  ].forEach(({ prepare }) => prepare());
};

export default { configure };
