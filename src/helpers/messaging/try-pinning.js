import PinMessageErrorMessage from '@tmible/wishlist-bot/constants/pin-message-error-message';

/**
 * Закрепление или открепление сообщения с учётом того, что, возможно, для этого недостаточно прав.
 * В таком случае API Телеграма бросит ошибку и она (и только она) будет поймана
 * @async
 * @function tryPinning
 * @param ctx {Context} Контекст
 * @param pinning {keyof Context} название метода закрепления или открепления
 * @param pinningArgs {Parameters<Context[pinning]>} Аргументы для редактирования сообщения
 */
const tryPinning = async (ctx, pinning, ...pinningArgs) => {
  try {
    await ctx[pinning](...pinningArgs);
  } catch(e) {
    if (!e.message.startsWith(PinMessageErrorMessage)) {
      throw e;
    }
  }
};

export default tryPinning;
