import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService } from './injection-tokens.js';
import * as networkService from './network.service.js';

/**
 * Регистрация зависисмостей для работы с действиями
 * @function initActionsFeature
 * @returns {() => void} Функция освбождения зависисмостей
 */
export const initActionsFeature = () => {
  provide(NetworkService, networkService);
  return () => deprive(NetworkService);
};
