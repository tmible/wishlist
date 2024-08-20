import cancelActionHandler from '@tmible/wishlist-bot/helpers/cancel-action-handler';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  /**
   * При вызове действия отмены добавления подарка в список жаланий запуск
   * [стандартного механизма отмены]{@link cancelActionHandler}
   * с отправкой сообщения-уведомления об отмене
   */
  bot.action('cancel_add', (ctx) => cancelActionHandler(ctx, 'Добавление отменено', false));
};

export default { configure };
