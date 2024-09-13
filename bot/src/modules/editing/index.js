import { inject } from '@tmible/wishlist-common/dependency-injector';
import configureModules from '@tmible/wishlist-bot/architecture/configure-modules';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import CancelClearListModule from './cancel-clear-list.js';
import ClearListModule from './clear-list.js';
import DeleteModule from './delete.js';
import OwnListModule from './own-list.js';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/**
 * Настройка модуля, обеспечивающего работу пользователя со своим списком желаний
 * @type {ModuleConfigureFunction}
 */
const configure = (bot) => {
  inject(InjectionToken.Logger).debug('configuring editing module');
  return configureModules(bot, [
    OwnListModule,
    DeleteModule,
    ClearListModule,
    CancelClearListModule,
  ]);
};

export default { configure };
