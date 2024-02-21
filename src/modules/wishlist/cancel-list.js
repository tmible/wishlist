import cancelActionHandler from '@tmible/wishlist-bot/helpers/cancel-action-handler';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/helpers/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  /**
   * При вызове действия отмены получения списка желаний запуск
   * [стандартного механизма отмены]{@link cancelActionHandler}
   * с отправкой сообщения-уведомления об отмене
   */
  bot.action('cancel_list', async (ctx) => await cancelActionHandler(ctx, 'Отменено', false));
};

export default { configure };
