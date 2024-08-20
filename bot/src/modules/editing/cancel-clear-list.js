import cancelActionHandler from '@tmible/wishlist-bot/helpers/cancel-action-handler';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  /**
   * При вызове действия отмены очищения списка запуск
   * [стандартного механизма отмены]{@link cancelActionHandler}
   * с отправкой сообщения-уведомления об отмене
   */
  bot.action(
    'cancel_clear_list',
    (ctx) => cancelActionHandler(ctx, 'Очищение списка отменено', false),
  );
};

export default { configure };
