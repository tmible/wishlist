import PinMessageErrorMessage from '@tmible/wishlist-bot/constants/pin-message-error-message';

/** @typedef {import('telegraf').Context} Context */

/**
 * Закрепление или открепление сообщения с учётом того, что, возможно, для этого недостаточно прав.
 * В таком случае API Телеграма бросит ошибку и она (и только она) будет поймана
 * @function tryPinning
 * @param {Context} ctx Контекст
 * @param {boolean} shouldPin Признак необходимости вызова метода закрепления
 * @param {Parameters<Context[pinning]>} pinningArgs Аргументы для редактирования сообщения
 * @async
 */
const tryPinning = async (ctx, shouldPin = true, ...pinningArgs) => {
  try {
    await ctx[`${shouldPin ? '' : 'un'}pinChatMessage`](...pinningArgs);
  } catch (e) {
    if (!e.message.startsWith(PinMessageErrorMessage)) {
      throw e;
    }
  }
};

export default tryPinning;
