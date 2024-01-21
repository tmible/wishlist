import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import cancelActionHandler from 'wishlist-bot/helpers/cancel-action-handler';

const configure = (bot) => {
  bot.action('cancel_answer', (ctx) => cancelActionHandler(ctx));
};

export default { configure };
