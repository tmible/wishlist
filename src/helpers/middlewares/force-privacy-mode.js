/** @typedef {import('telegraf').Context} Context */

/**
 * Промежуточный обработчик, обеспечивающий использование
 * [приватного режима]{@link https://core.telegram.org/bots/features#privacy-mode},
 * даже если он выключен
 * @function forcePrivacyModeMiddleware
 * @param {Context} ctx Контекст
 * @param {() => Promise<void>} next Функция вызова следующего промежуточного обработчика
 * @returns {Promise<void>}
 * @async
 */
const forcePrivacyModeMiddleware = async (ctx, next) => {
  if (
    ctx.updateType === 'message' &&
    !ctx.message.entities?.find(({ type }) => type === 'bot_command') &&
    ctx.message.reply_to_message?.from.id !== ctx.botInfo.id
  ) {
    return;
  }

  await next();
};

export default forcePrivacyModeMiddleware;
