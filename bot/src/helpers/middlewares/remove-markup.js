/** @typedef {import('telegraf').Context} Context */

/**
 * Множество разрешённых методов для отправки сообщения
 * @constant {Set<keyof Context>}
 */
const AllowedSendMethods = new Set([ 'reply', 'replyWithMarkdownV2' ]);

/**
 * Проверка метода для отправки сообщения на наличие во множестве разрешённых
 * @function sendMethodGuard
 * @param {keyof Context} sendMethod Имя метода отправки сообщения
 * @returns {keyof Context} Имя метода отправки сообщения, прошедшего проверку
 * @throws {Error} Ошибка в случае отсутствия метода отправки сообщения во множестве разрешённых
 */
const sendMethodGuard = (sendMethod) => {
  if (!AllowedSendMethods.has(sendMethod)) {
    throw new Error(`Not allowed send method ${sendMethod} detected`);
  }
  return sendMethod;
};

/**
 * Отправка сообщения и отметка его для удаления встроенной клавиатуры
 * при получении следующего обновления от пользователя
 * @function sendMessageAndMarkItForMarkupRemove
 * @param {Context} ctx Контекст
 * @param {keyof Context} sendMethod Имя метода отправки сообщения
 * @param {Parameters<Context[sendMethod]>} messageArgs Аргументы для отправки сообщения
 * @async
 */
export const sendMessageAndMarkItForMarkupRemove = async (ctx, sendMethod, ...messageArgs) => {
  const message = await ctx[sendMethodGuard(sendMethod)](...messageArgs);
  ctx.session.persistent.messageForMarkupRemove = {
    id: message.message_id,
    chatId: message.chat.id,
  };
};

/**
 * Промежуточный обработчик, удаляющий у [отмеченного]{@link sendMessageAndMarkItForMarkupRemove}
 * сообщения (при наличии) встроенную клавиатуру
 * @function removeLastMarkupMiddleware
 * @param {Context} ctx Контекст
 * @param {() => Promise<void>} next Функция вызова следующего промежуточного обработчика
 * @returns {Promise<void>}
 * @async
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
