import TmibleId from 'wishlist-bot/constants/tmible-id';

const initiateUpdate = async (ctx, sessionKeys, reply) => {
  if (ctx.update.callback_query.message.chat.id !== TmibleId) {
    return;
  }

  ctx.session = { ...ctx.session, [sessionKeys[0]]: true, [sessionKeys[1]]: ctx.match[1] };
  await ctx.reply(reply);
};

export default initiateUpdate;
