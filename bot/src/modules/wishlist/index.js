import { inject } from '@tmible/wishlist-common/dependency-injector';
import configureModules from '@tmible/wishlist-bot/architecture/configure-modules';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import BookModule from './book.js';
import CancelListModule from './cancel-list.js';
import CooperateModule from './cooperate.js';
import ListModule from './list.js';
import RetireModule from './retire.js';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/**
 * Настройка модуля просмотра списков желаний
 * других пользователей и взаимодействия с ними
 * @type {ModuleConfigureFunction}
 */
const configure = (bot) => {
  inject(InjectionToken.Logger).debug('configuring wishlist module');
  return configureModules(bot, [
    ListModule,
    CancelListModule,
    BookModule,
    CooperateModule,
    RetireModule,
  ]);
};

export default { configure };
