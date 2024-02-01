import cancelActionHandler from '@tmible/wishlist-bot/helpers/cancel-action-handler';

/**
 * При вызове действия отмены очищения списка запуск
 * [стандартного механизма отмены]{@link cancelActionHandler} с отправкой сообщения-уведомления об отмене
 */
const configure = (bot) => {
  bot.action(
    'cancel_clear_list',
    (ctx) => cancelActionHandler(ctx, 'Очищение списка отменено', false),
  );
};

export default { configure };
