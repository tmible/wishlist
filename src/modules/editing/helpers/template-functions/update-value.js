import { emit } from 'wishlist-bot/store/event-bus';
import sendList from '../send-list.js';

const updateValue = async (
  ctx,
  sessionKeys,
  valueRegexp,
  errorMessage,
  event,
  successMessage,
) => {
  if (sessionKeys.some((key) => !ctx.session?.[key])) {
    return;
  }

  const match = valueRegexp.exec(ctx.update.message.text);
  const itemId = ctx.session[sessionKeys[1]];

  for (const key of sessionKeys) {
    delete ctx.session[key];
  }

  if (!match) {
    return ctx.reply(errorMessage);
  }

  await emit(event, itemId, match[0]);

  await ctx.reply(successMessage);
  await sendList(ctx);
};

export default updateValue;
