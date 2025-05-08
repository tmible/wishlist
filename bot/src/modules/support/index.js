import { inject } from '@tmible/wishlist-common/dependency-injector';
import configureModules from '@tmible/wishlist-bot/architecture/configure-modules';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import AnswerModule from './answer.js';
import CancelAnswerModule from './cancel-answer.js';
import CancelMessageModule from './cancel-message.js';
import MessageModule from './message.js';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/**
 * Настройка модуля поддержки пользователей
 * @type {ModuleConfigureFunction}
 */
const configure = (bot) => {
  inject(InjectionToken.Logger).debug('configuring support module');
  return configureModules(bot, [
    AnswerModule,
    CancelAnswerModule,
    CancelMessageModule,
    MessageModule,
  ]);
};

export default { configure };
