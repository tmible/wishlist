import ListItemState from 'wishlist-bot/constants/list-item-state';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

/**
 * При вызове действия бронирования подарка [выпуск]{@link emit} соответсвующего события
 * и [отправка обновлённого или обновление отправленного ранее списка]{@link sendList}
 */
const configure = (bot) => {
  bot.action(/^book (\d+) ([0-9]+)$/, async (ctx) => {
    const id = ctx.match[1];

    emit(Events.Wishlist.BookItem, id, ctx.from.id);

    await sendList(ctx, ctx.match[2]);
  });
};

export default { configure };
