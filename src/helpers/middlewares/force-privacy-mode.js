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
  const isBotMentioned = !!ctx.message.entities?.some((entity) => {
    const entityText = ctx.message.text.slice(entity.offset, entity.offset + entity.length);
    return entity.type === 'mention' && entityText === `@${ctx.botInfo.username}`;
  });

  if (
    ctx.updateType === 'message' &&
    !ctx.message.entities?.some(({ type }) => type === 'bot_command') &&
    !isBotMentioned &&
    ctx.message.reply_to_message?.from.id !== ctx.botInfo.id
  ) {
    return;
  }

  await next();
};

export default forcePrivacyModeMiddleware;
