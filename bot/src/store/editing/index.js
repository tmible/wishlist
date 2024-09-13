import { inject } from '@tmible/wishlist-common/dependency-injector';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import DeleteItems from './delete-items.js';
import GetList from './get-list.js';

/**
 * @module Модуль хранилища для обеспечения работы
 * пользователей с собственными списками желаний
 */

/**
 * Настройка модуля хранилища
 * Подписка на [события]{@link Events} и подготовка выражений запроса БД
 * @function configure
 */
const configure = () => {
  const eventBus = inject(InjectionToken.EventBus);

  [
    [ Events.Editing.DeleteItems, DeleteItems ],
    [ Events.Editing.GetList, GetList ],
  /* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
    Пробел нужен для консистентности с другими элементами массива
  */
  ].forEach(([ event, { eventHandler } ]) => eventBus.subscribe(event, eventHandler));

  [
    GetList,
  ].forEach(({ prepare }) => prepare());
};

export default { configure };
