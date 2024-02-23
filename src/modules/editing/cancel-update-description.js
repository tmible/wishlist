import cancelActionHandler from '@tmible/wishlist-bot/helpers/cancel-action-handler';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  /**
   * При вызове действия отмены обновления описания подарка запуск
   * [стандартного механизма отмены]{@link cancelActionHandler} с удалением сообщения-приглашения
   */
  bot.action('cancel_update_description', (ctx) => cancelActionHandler(ctx));
};

export default { configure };
