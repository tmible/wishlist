const configure = (bot) => {
  bot.action(/^answer ([\-\d]+) ([\-\d]+)$/, (ctx) => {
    ctx.session = { ...ctx.session, answerChatId: ctx.match[1], answerToMessageId: ctx.match[2] };
    return ctx.reply('Отправьте сообщение, и я перешлю его');
  });
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session?.answerChatId && ctx.session?.answerToMessageId) {
      await ctx.telegram.sendMessage(
        ctx.session.answerChatId,
        'Ответ:',
        { reply_to_message_id: ctx.session.answerToMessageId },
      );
      await ctx.forwardMessage(
        ctx.session.answerChatId,
        ctx.update.message.chat.id,
        ctx.update.message.message_id,
      );

      delete ctx.session.answerChatId;
      delete ctx.session.answerToMessageId;
      return ctx.reply('Ответ отправлен!');
    }

    return next();
  });
};

export default { configure, messageHandler };
