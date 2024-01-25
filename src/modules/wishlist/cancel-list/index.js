import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import cancelActionHandler from 'wishlist-bot/helpers/cancel-action-handler';

/**
 * При вызове действия отмены получения списка желаний запуск
 * [стандартного механизма отмены]{@link cancelActionHandler} с отправкой сообщения-уведомления об отмене
 */
const configure = (bot) => {
  bot.action('cancel_list', (ctx) => cancelActionHandler(ctx, 'Отменено', false));
};

export default { configure };
