/** @typedef {import('telegraf').Context} Context */

/**
 * Промежуточный обработчик, удаляющий из сессии информацию о назначении
 * ожидаемого от пользователя сообщения по окончании обработчки сообщения,
 * если назначение не изменилось
 * @function deleteMessagePurposeMiddleware
 * @param {Context} ctx Контекст
 * @param {() => Promise<void>} next Функция вызова следующего промежуточного обработчика
 * @async
 */
const deleteMessagePurposeMiddleware = async (ctx, next) => {
  const memoized = ctx.session.messagePurpose?.type;
  try {
    await next();
  } finally {
    if (memoized === ctx.session.messagePurpose?.type) {
      delete ctx.session.messagePurpose;
    }
  }
};

export default deleteMessagePurposeMiddleware;
