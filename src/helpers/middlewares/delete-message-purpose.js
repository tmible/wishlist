/**
 * Промежуточный обработчик, удаляющий из сессии информацию о назначении
 * ожидаемого от пользователя сообщения по окончании обработчки сообщения
 * @async
 * @function deleteMessagePurposeMiddleware
 * @param {Context} ctx Контекст
 * @param {() => Promise<void>} next Функция вызова следующего промежуточного обработчика
 */
const deleteMessagePurposeMiddleware = async (ctx, next) => {
  try {
    await next();
  } finally {
    delete ctx.session.messagePurpose;
  }
};

export default deleteMessagePurposeMiddleware;
