import TmibleId from 'wishlist-bot/constants/tmible-id';

const configure = (bot) => {
  bot.action('cancel_message', async (ctx) => {
    if (ctx.update.callback_query.message.chat.id === TmibleId) {
      return;
    }

    if (!ctx.session.sendMessageAnonymously) {
      return;
    }

    delete ctx.session.sendMessageAnonymously;
    return ctx.reply('Отправка сообщения отменена');
  });
};

export default { configure };
