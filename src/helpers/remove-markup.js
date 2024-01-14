export const sendMessageAndMarkItForMarkupRemove = async (ctx, sendMethod, ...messageArgs) => {
  const message = await ctx[sendMethod](...messageArgs);

  ctx.session.messageForMarkupRemove = {
    id: message.message_id,
    chatId: message.chat.id,
  };
};

export const removeLastMarkup = async (ctx) => {
  await ctx.telegram.editMessageReplyMarkup(
    ctx.session.messageForMarkupRemove.chatId,
    ctx.session.messageForMarkupRemove.id,
  );

  delete ctx.session.messageForMarkupRemove;
};
