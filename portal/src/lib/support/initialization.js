import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { NetworkService } from './injection-tokens.js';
import * as networkService from './network.service.js';

/**
 * Регистрация зависисмостей для работы с поддержкой
 * @function initSupportFeature
 * @returns {() => void} Функция освбождения зависисмостей
 */
const initSupportFeature = () => {
  provide(NetworkService, networkService);
  return () => deprive(NetworkService);
};

export default initSupportFeature;
