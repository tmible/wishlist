import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import cancelActionHandler from 'wishlist-bot/helpers/cancel-action-handler';

/**
 * При вызове действия отмены отправки анонимного сообщения запуск
 * [стандартного механизма отмены]{@link cancelActionHandler} с отправкой сообщения-уведомления об отмене
 */
const configure = (bot) => {
  bot.action(
    'cancel_message',
    (ctx) => cancelActionHandler(ctx, 'Отправка сообщения отменена', false),
  );
};

export default { configure };
