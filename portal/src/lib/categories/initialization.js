import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService, Store } from './injection-tokens.js';
import * as networkService from './network.service.js';
import { categories } from './store.js';

/**
 * Регистрация зависисмостей и подписка на события для работы с категориями
 * @function initCategoriesFeature
 * @returns {() => void} Функция освбождения зависисмостей и отписки от событий
 */
export const initCategoriesFeature = () => {
  provide(Store, categories);
  provide(NetworkService, networkService);

  return () => {
    deprive(Store);
    deprive(NetworkService);
  };
};
