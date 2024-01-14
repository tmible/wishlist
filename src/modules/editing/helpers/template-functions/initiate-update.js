import TmibleId from 'wishlist-bot/constants/tmible-id';
import { sendMessageAndMarkItForMarkupRemove } from 'wishlist-bot/helpers/remove-markup';

const initiateUpdate = async (ctx, sessionKey, reply) => {
  if (ctx.update.callback_query.message.chat.id !== TmibleId) {
    return;
  }

  ctx.session[sessionKey] = ctx.match[1];
  await sendMessageAndMarkItForMarkupRemove(ctx, 'reply', ...reply);
};

export default initiateUpdate;
