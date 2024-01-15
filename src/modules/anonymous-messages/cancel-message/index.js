const configure = (bot) => {
  bot.action('cancel_message', (ctx) => {
    if (!ctx.session.anonymousMessageChatId && !ctx.session.waitingForUsernameForMessage) {
      return;
    }

    delete ctx.session.anonymousMessageChatId;
    delete ctx.session.waitingForUsernameForMessage;

    return ctx.reply('Отправка сообщения отменена');
  });
};

export default { configure };
