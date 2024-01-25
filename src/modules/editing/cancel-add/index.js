import cancelActionHandler from 'wishlist-bot/helpers/cancel-action-handler';

/**
 * При вызове действия отмены добавления подарка в список жаланий запуск
 * [стандартного механизма отмены]{@link cancelActionHandler} с отправкой сообщения-уведомления об отмене
 */
const configure = (bot) => {
  bot.action('cancel_add', (ctx) => cancelActionHandler(ctx, 'Добавление отменено', false));
};

export default { configure };
