/**
 * Отправка сообщения и отметка его для удаления встроенной клавиатуры
 * при получении следующего обновления от пользователя
 * @async
 * @function sendMessageAndMarkItForMarkupRemove
 * @param {Context} ctx Контекст
 * @param {keyof Context} sendMethod Имя метода отправки сообщения
 * @param {Parameters<Context[sendMethod]>} messageArgs Аргументы для отправки сообщения
 */
export const sendMessageAndMarkItForMarkupRemove = async (ctx, sendMethod, ...messageArgs) => {
  const message = await ctx[sendMethod](...messageArgs);

  ctx.session.persistent.messageForMarkupRemove = {
    id: message.message_id,
    chatId: message.chat.id,
  };
};

/**
 * Промежуточный обработчик, удаляющий у [отмеченного]{@link sendMessageAndMarkItForMarkupRemove}
 * сообщения (при наличии) встроенную клавиатуру
 * @async
 * @function removeLastMarkupMiddleware
 * @param {Context} ctx Контекст
 * @param {() => Promise<void>} next Функция вызова следующего промежуточного обработчика
 */
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
