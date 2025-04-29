import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { LinkService, NetworkService, Store } from './injection-tokens.js';
import * as linkService from './link.service.js';
import * as networkService from './network.service.js';
import { wishlist } from './store.js';

/**
 * Регистрация зависисмостей для работы со списком желаний
 * @function initWishlistFeature
 * @returns {() => void} Функция освбождения зависисмостей
 */
export const initWishlistFeature = () => {
  provide(Store, wishlist);
  provide(NetworkService, networkService);
  provide(LinkService, linkService);

  return () => {
    deprive(Store);
    deprive(NetworkService);
    deprive(LinkService);
  };
};
