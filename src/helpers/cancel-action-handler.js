const cancelActionHandler = async (ctx, reply, deleteMessage = true) => {
  if (deleteMessage) {
    await ctx.deleteMessage();
  }

  delete ctx.session.messagePurpose;

  if (deleteMessage) {
    return;
  }

  await ctx.reply(reply);
};

export default cancelActionHandler;
