import {
  sendMessageAndMarkItForMarkupRemove,
} from 'wishlist-bot/helpers/middlewares/remove-markup';

const initiateUpdate = async (ctx, sessionKey, reply) => {
  ctx.session[sessionKey] = ctx.match[1];
  await sendMessageAndMarkItForMarkupRemove(ctx, 'reply', ...reply);
};

export default initiateUpdate;
