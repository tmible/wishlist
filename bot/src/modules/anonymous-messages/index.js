import configureModules from '@tmible/wishlist-bot/architecture/configure-modules';
import { inject } from '@tmible/wishlist-bot/architecture/dependency-injector';
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
 * Настройка модуля отправки анонимных сообщений и ответов на них
 * @type {ModuleConfigureFunction}
 */
const configure = (bot) => {
  inject(InjectionToken.Logger).debug('configuring anonymous messages module');
  return configureModules(bot, [
    AnswerModule,
    CancelAnswerModule,
    CancelMessageModule,
    MessageModule,
  ]);
};

export default { configure };
