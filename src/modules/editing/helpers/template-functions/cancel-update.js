const cancelUpdate = async (ctx, sessionKey, reply, deleteMessage = true) => {
  if (deleteMessage) {
    await ctx.deleteMessage();
  }

  if (ctx.session[sessionKey]) {
    delete ctx.session[sessionKey];
  }

  if (deleteMessage) {
    return;
  }

  await ctx.reply(reply);
};

export default cancelUpdate;
