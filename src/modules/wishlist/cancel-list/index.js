const configure = (bot) => {
  bot.action('cancel_list', async (ctx) => {
    if (!ctx.session.waitingForUsernameForList) {
      return;
    }
    delete ctx.session.waitingForUsernameForList;
    await ctx.sendMessage('Отменено');
  });
};

export default { configure };
