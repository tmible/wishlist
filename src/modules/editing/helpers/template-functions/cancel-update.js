import TmibleId from 'wishlist-bot/constants/tmible-id';

const cancelUpdate = async (ctx, sessionKeys, reply) => {
  if (ctx.update.message.chat.id !== TmibleId) {
    return;
  }

  for (const key of sessionKeys) {
    if (ctx.session[key]) {
      delete ctx.session[key];
    }
  }

  await ctx.reply(reply);
};

export default cancelUpdate;
