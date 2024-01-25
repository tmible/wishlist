import cancelActionHandler from 'wishlist-bot/helpers/cancel-action-handler';

/**
 * При вызове действия отмены обновления описания подарка запуск
 * [стандартного механизма отмены]{@link cancelActionHandler} с удалением сообщения-приглашения
 */
const configure = (bot) => {
  bot.action('cancel_update_description', (ctx) => cancelActionHandler(ctx));
};

export default { configure };
