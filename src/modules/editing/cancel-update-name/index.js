import cancelActionHandler from 'wishlist-bot/helpers/cancel-action-handler';

/**
 * При вызове действия отмены обновления названия подарка запуск
 * [стандартного механизма отмены]{@link cancelActionHandler} с удалением сообщения-приглашения
 */
const configure = (bot) => {
  bot.action('cancel_update_name', (ctx) => cancelActionHandler(ctx));
};

export default { configure };
