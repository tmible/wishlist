import {
  sendMessageAndMarkItForMarkupRemove,
} from 'wishlist-bot/helpers/middlewares/remove-markup';

const initiateUpdate = async (ctx, messagePurposeType, reply) => {
  ctx.session.messagePurpose = {
    type: messagePurposeType,
    payload: ctx.match[1],
  };
  await sendMessageAndMarkItForMarkupRemove(ctx, 'reply', ...reply);
};

export default initiateUpdate;
