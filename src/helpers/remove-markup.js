export const sendMessageAndMarkItForMarkupRemove = async (ctx, sendMethod, ...messageArgs) => {
  const message = await ctx[sendMethod](...messageArgs);

  ctx.session.messageForMarkupRemove = {
    id: message.message_id,
    chatId: message.chat.id,
  };
};

export const removeLastMarkupMiddleware = async (ctx, next) => {
  if (!ctx.session.messageForMarkupRemove) {
    return next();
  }

  await ctx.telegram.editMessageReplyMarkup(
    ctx.session.messageForMarkupRemove.chatId,
    ctx.session.messageForMarkupRemove.id,
  );

  delete ctx.session.messageForMarkupRemove;

  return next();
};
