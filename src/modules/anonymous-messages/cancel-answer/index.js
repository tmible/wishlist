const configure = (bot) => {
  bot.action('cancel_answer', async (ctx) => {
    if (!ctx.session.answerChatId && !ctx.session.answerToMessageId) {
      return;
    }

    delete ctx.session.answerChatId;
    delete ctx.session.answerToMessageId;
    return ctx.deleteMessage();
  });
};

export default { configure };
