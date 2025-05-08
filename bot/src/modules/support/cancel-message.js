import cancelActionHandler from '@tmible/wishlist-bot/helpers/cancel-action-handler';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  /**
   * При вызове действия отмены отправки сообщения в поддержку запуск
   * [стандартного механизма отмены]{@link cancelActionHandler}
   * с отправкой сообщения-уведомления об отмене
   */
  bot.action(
    'cancel_support_message',
    (ctx) => cancelActionHandler(ctx, 'Отправка сообщения отменена', false),
  );
};

export default { configure };
