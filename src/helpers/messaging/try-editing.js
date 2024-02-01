import EditMessageErrorMessage from '@tmible/wishlist-bot/constants/edit-message-error-message';

/**
 * Редактирование сообщения с учётом того, что, возможно, обновлений нет.
 * В таком случае API Телеграма бросит ошибку и она (и только она) будет поймана
 * @async
 * @function tryEditing
 * @param ctx {Context} Контекст
 * @param editingArgs {Parameters<Telegram[editMessageText]>} Аргументы для редактирования сообщения
 */
const tryEditing = async (ctx, ...editingArgs) => {
  try {
    await ctx.telegram.editMessageText(...editingArgs);
  } catch(e) {
    if (!e.message.startsWith(EditMessageErrorMessage)) {
      throw e;
    }
  }
};

export default tryEditing;
