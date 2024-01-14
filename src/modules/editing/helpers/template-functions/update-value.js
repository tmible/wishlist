import { removeLastMarkup } from 'wishlist-bot/helpers/remove-markup';
import { emit } from 'wishlist-bot/store/event-bus';
import sendList from '../send-list.js';

const updateValue = async (
  ctx,
  sessionKey,
  valueRegexp,
  errorMessage,
  event,
  successMessage,
) => {
  if (!ctx.session[sessionKey]) {
    return;
  }

  await removeLastMarkup(ctx);

  const match = valueRegexp.exec(ctx.update.message.text);
  const itemId = ctx.session[sessionKey];

  delete ctx.session[sessionKey];

  if (!match) {
    return ctx.reply(errorMessage);
  }

  await emit(event, itemId, match[0]);

  await ctx.reply(successMessage);
  await sendList(ctx);
};

export default updateValue;
