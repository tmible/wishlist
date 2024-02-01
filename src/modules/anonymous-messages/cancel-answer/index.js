import cancelActionHandler from 'wishlist-bot/helpers/cancel-action-handler';

/**
 * При вызове действия отмены ответа на анонимное сообщение запуск
 * [стандартного механизма отмены]{@link cancelActionHandler} с удалением сообщения-приглашения
 */
const configure = (bot) => {
  bot.action('cancel_answer', (ctx) => cancelActionHandler(ctx));
};

export default { configure };
