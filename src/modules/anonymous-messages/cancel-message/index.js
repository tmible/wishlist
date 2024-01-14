import TmibleId from 'wishlist-bot/constants/tmible-id';
import { removeLastMarkup } from 'wishlist-bot/helpers/remove-markup';

const configure = (bot) => {
  bot.action('cancel_message', async (ctx) => {
    if (ctx.update.callback_query.message.chat.id === TmibleId) {
      return;
    }

    if (!ctx.session.sendMessageAnonymously) {
      return;
    }

    await removeLastMarkup(ctx);

    delete ctx.session.sendMessageAnonymously;
    return ctx.reply('Отправка сообщения отменена');
  });
};

export default { configure };
