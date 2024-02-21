/** @typedef {import('telegraf').Context} Context */

/**
 * Обработчик действия отмены
 * При необходимости удаляет сообщение-приглашение,
 * удаляет из сессии информацию о назначении ожидаемого от пользователя сообщения,
 * при необходимости отправляет сообщение -- подтверждение отмены
 * @function cancelActionHandler
 * @param {Context} ctx Контекст
 * @param {string} [reply] Текст сообщения -- подтверждения отмены
 * @param {boolean} deleteMessage Признак необходимости удаления сообщения-приглашения
 * @returns {Promise<void>}
 * @async
 */
const cancelActionHandler = async (ctx, reply, deleteMessage = true) => {
  if (deleteMessage) {
    await ctx.deleteMessage();
  }

  delete ctx.session.messagePurpose;

  if (deleteMessage) {
    return;
  }

  await ctx.reply(reply);
};

export default cancelActionHandler;
