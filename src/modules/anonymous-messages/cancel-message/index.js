import TmibleId from 'wishlist-bot/constants/tmible-id';

const configure = (bot) => {
  bot.command('cancel_message', (ctx) => {
    if (ctx.update.message.chat.id === TmibleId) {
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
