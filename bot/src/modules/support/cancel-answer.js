import cancelActionHandler from '@tmible/wishlist-bot/helpers/cancel-action-handler';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  /**
   * При вызове действия отмены ответа на сообщение в поддержку запуск
   * [стандартного механизма отмены]{@link cancelActionHandler} с удалением сообщения-приглашения
   */
  bot.action('cancel_support_answer', (ctx) => cancelActionHandler(ctx));
};

export default { configure };
