import configureModules from '@tmible/wishlist-bot/helpers/configure-modules';
import AnswerModule from './answer.js';
import CancelAnswerModule from './cancel-answer.js';
import CancelMessageModule from './cancel-message.js';
import MessageModule from './message.js';

/**
 * Настройка модуля отправки анонимных сообщений и ответов на них
 * @function configure
 */
const configure = (bot) => {
  console.log('configuring anonymous messages module');
  configureModules(bot, [
    AnswerModule,
    CancelAnswerModule,
    CancelMessageModule,
    MessageModule,
  ]);
};

export default { configure };
