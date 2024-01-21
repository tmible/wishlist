export const sendMessageAndMarkItForMarkupRemove = async (ctx, sendMethod, ...messageArgs) => {
  const message = await ctx[sendMethod](...messageArgs);

  ctx.session.persistent.messageForMarkupRemove = {
    id: message.message_id,
    chatId: message.chat.id,
  };
};

export const removeLastMarkupMiddleware = async (ctx, next) => {
  if (!ctx.session.persistent.messageForMarkupRemove) {
    return next();
  }

  await ctx.telegram.editMessageReplyMarkup(
    ctx.session.persistent.messageForMarkupRemove.chatId,
    ctx.session.persistent.messageForMarkupRemove.id,
  );

  delete ctx.session.persistent.messageForMarkupRemove;

  return next();
};
