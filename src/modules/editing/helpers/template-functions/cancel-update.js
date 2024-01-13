import TmibleId from 'wishlist-bot/constants/tmible-id';

const cancelUpdate = async (ctx, sessionKey, reply) => {
  if (ctx.update.callback_query.message.chat.id !== TmibleId) {
    return;
  }

  if (ctx.session[sessionKey]) {
    delete ctx.session[sessionKey];
  }

  await ctx.reply(reply);
};

export default cancelUpdate;
