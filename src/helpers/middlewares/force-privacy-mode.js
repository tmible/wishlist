/**
 * Промежуточный обработчик, обеспечивающий использование [приватного режима]{@link https://core.telegram.org/bots/features#privacy-mode},
 * даже если он выключен
 * @async
 * @function forcePrivacyModeMiddleware
 * @param {Context} ctx Контекст
 * @param {() => Promise<void>} next Функция вызова следующего промежуточного обработчика
 */
const forcePrivacyModeMiddleware = (ctx, next) => {
  if (
    ctx.updateType === 'message' &&
    !ctx.message.entities?.find(({ type }) => type === 'bot_command') &&
    ctx.message.reply_to_message?.from.id !== ctx.botInfo.id
  ) {
    return;
  }

  return next();
};

export default forcePrivacyModeMiddleware;
