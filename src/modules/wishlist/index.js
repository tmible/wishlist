import configureModules from '@tmible/wishlist-bot/architecture/configure-modules';
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
  console.log('configuring wishlist module');
  return configureModules(bot, [
    ListModule,
    CancelListModule,
    BookModule,
    CooperateModule,
    RetireModule,
  ]);
};

export default { configure };
