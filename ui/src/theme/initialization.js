import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { ThemeService } from './injection-tokens.js';
import * as themeService from './service.js';

/**
 * Регистрация зависисмостей для работы с цветовой темой
 * @function initThemeFeature
 * @returns {() => void} Функция освбождения зависисмостей
 */
export const initThemeFeature = () => {
  provide(ThemeService, themeService);
  return () => deprive(ThemeService);
};
