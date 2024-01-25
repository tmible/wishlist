import configureModules from 'wishlist-bot/helpers/configure-modules';
import AnswerModule from 'wishlist-bot/modules/anonymous-messages/answer';
import CancelAnswerModule from 'wishlist-bot/modules/anonymous-messages/cancel-answer';
import CancelMessageModule from 'wishlist-bot/modules/anonymous-messages/cancel-message';
import MessageModule from 'wishlist-bot/modules/anonymous-messages/message';

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
