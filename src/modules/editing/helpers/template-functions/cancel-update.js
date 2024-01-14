import TmibleId from 'wishlist-bot/constants/tmible-id';

const cancelUpdate = async (ctx, sessionKey, reply, deleteMessage = true) => {
  if (ctx.update.callback_query.message.chat.id !== TmibleId) {
    return;
  }

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
