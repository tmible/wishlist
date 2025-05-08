import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { subscribe, unsubscribe } from '@tmible/wishlist-common/event-bus';
import { GetUserHash } from './events.js';
import { NetworkService, Store } from './injection-tokens.js';
import * as networkService from './network.service.js';
import { user } from './store.js';
import { getHash } from './use-cases/get-hash.js';

/**
 * Регистрация зависисмостей и подписка на события для работы с пользователем
 * @function initUserFeature
 * @returns {() => void} Функция освбождения зависисмостей и отписки от событий
 */
export const initUserFeature = () => {
  provide(Store, user);
  provide(NetworkService, networkService);
  subscribe(GetUserHash, getHash);

  return () => {
    unsubscribe(GetUserHash);
    deprive(Store);
    deprive(NetworkService);
  };
};
