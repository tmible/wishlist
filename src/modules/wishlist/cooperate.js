import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import sendList from './helpers/send-list.js';

/**
 * При вызове действия добавления в кооперация по подарку [выпуск]{@link emit} соответсвующего события
 * и [отправка обновлённого или обновление отправленного ранее списка]{@link sendList}
 */
const configure = (bot) => {
  bot.action(/^cooperate (\d+) (\d+)$/, async (ctx) => {
    emit(Events.Wishlist.CooperateOnItem, parseInt(ctx.match[1]), ctx.from.id);
    await sendList(ctx, parseInt(ctx.match[2]));
  });
};

export default { configure };
