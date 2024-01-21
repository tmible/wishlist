import { emit } from 'wishlist-bot/store/event-bus';
import sendList from '../send-list.js';

const updateValue = async (
  ctx,
  messagePurposeType,
  valueRegexp,
  errorMessage,
  event,
  successMessage,
) => {
  if (ctx.session.messagePurpose?.type !== messagePurposeType) {
    return;
  }

  const match = valueRegexp.exec(ctx.update.message.text);
  const itemId = ctx.session.messagePurpose.payload;

  delete ctx.session.messagePurpose;

  if (!match) {
    return ctx.reply(errorMessage);
  }

  await emit(event, itemId, match[0]);

  await ctx.reply(successMessage);
  await sendList(ctx);
};

export default updateValue;
