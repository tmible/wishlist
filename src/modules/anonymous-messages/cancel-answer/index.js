import TmibleId from 'wishlist-bot/constants/tmible-id';

const configure = (bot) => {
  bot.action('cancel_answer', (ctx) => {
    if (ctx.update.callback_query.message.chat.id !== TmibleId) {
      return;
    }

    if (!ctx.session.answerChatId && !ctx.session.answerToMessageId) {
      return;
    }

    delete ctx.session.answerChatId;
    delete ctx.session.answerToMessageId;
    return ctx.reply('Отправка ответа отменена');
  });
};

export default { configure };
