import EditMessageErrorMessage from '@tmible/wishlist-bot/constants/edit-message-error-message';

/**
 * @typedef {import('telegraf').Context} Context
 * @typedef {import('telegraf').Telegram} Telegram
 */

/**
 * Редактирование сообщения с учётом того, что, возможно, обновлений нет.
 * В таком случае API Телеграма бросит ошибку и она (и только она) будет поймана
 * @function tryEditing
 * @param {Context} ctx Контекст
 * @param {Parameters<Telegram[editMessageText]>} editingArgs Аргументы для редактирования сообщения
 * @async
 */
const tryEditing = async (ctx, ...editingArgs) => {
  try {
    await ctx.telegram.editMessageText(...editingArgs);
  } catch (e) {
    if (!e.message.startsWith(EditMessageErrorMessage)) {
      throw e;
    }
  }
};

export default tryEditing;
