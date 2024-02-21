import configureModules from '@tmible/wishlist-bot/helpers/configure-modules';
import AnswerModule from './answer.js';
import CancelAnswerModule from './cancel-answer.js';
import CancelMessageModule from './cancel-message.js';
import MessageModule from './message.js';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/helpers/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/**
 * Настройка модуля отправки анонимных сообщений и ответов на них
 * @type {ModuleConfigureFunction}
 */
const configure = (bot) => {
  console.log('configuring anonymous messages module');
  return configureModules(bot, [
    AnswerModule,
    CancelAnswerModule,
    CancelMessageModule,
    MessageModule,
  ]);
};

export default { configure };
