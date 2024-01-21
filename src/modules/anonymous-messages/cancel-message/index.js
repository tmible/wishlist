import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import cancelActionHandler from 'wishlist-bot/helpers/cancel-action-handler';

const configure = (bot) => {
  bot.action(
    'cancel_message',
    (ctx) => cancelActionHandler(ctx, 'Отправка сообщения отменена', false),
  );
};

export default { configure };
