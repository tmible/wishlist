import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import sendList from './helpers/send-list.js';

/**
 * При вызове действия бронирования подарка [выпуск]{@link emit} соответсвующего события
 * и [отправка обновлённого или обновление отправленного ранее списка]{@link sendList}
 */
const configure = (bot) => {
  bot.action(/^book (\d+) (\d+)$/, async (ctx) => {
    emit(Events.Wishlist.BookItem, parseInt(ctx.match[1]), ctx.from.id);
    await sendList(ctx, parseInt(ctx.match[2]));
  });
};

export default { configure };
