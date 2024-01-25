import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

/**
 * При вызове действия отказа от участия в подарке (отмена бронирования или выход из кооперации)
 * [выпуск]{@link emit} соответсвующего события и
 * [отправка обновлённого или обновление отправленного ранее списка]{@link sendList}
 */
const configure = (bot) => {
  bot.action(/^retire (\d+) ([0-9]+)$/, async (ctx) => {
    emit(Events.Wishlist.RetireFromItem, ctx.match[1], ctx.from.id);
    await sendList(ctx, ctx.match[2]);
  });
};

export default { configure };
