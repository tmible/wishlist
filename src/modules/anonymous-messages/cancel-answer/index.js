import TmibleId from 'wishlist-bot/constants/tmible-id';
import { removeLastMarkup } from 'wishlist-bot/helpers/remove-markup';

const configure = (bot) => {
  bot.action('cancel_answer', async (ctx) => {
    if (ctx.update.callback_query.message.chat.id !== TmibleId) {
      return;
    }

    if (!ctx.session.answerChatId && !ctx.session.answerToMessageId) {
      return;
    }

    await removeLastMarkup(ctx);

    delete ctx.session.answerChatId;
    delete ctx.session.answerToMessageId;
    return ctx.deleteMessage();
  });
};

export default { configure };
