import TmibleId from 'wishlist-bot/constants/tmible-id';

const initiateUpdate = async (ctx, sessionKey, reply) => {
  if (ctx.update.callback_query.message.chat.id !== TmibleId) {
    return;
  }

  ctx.session[sessionKey] = ctx.match[1];
  await ctx.reply(...reply);
};

export default initiateUpdate;
