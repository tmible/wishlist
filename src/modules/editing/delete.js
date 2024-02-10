import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import sendList from './helpers/send-list.js';

/**
 * При вызове действия удаления подарка из списка желаний
 * бот [выпускает]{@link emit} соответствующее событие,
 * и [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
 */
const configure = (bot) => {
  bot.action(/^delete ([\-\d]+)$/, async (ctx) => {
    emit(Events.Editing.DeleteItems, [ ctx.match[1] ]);
    await sendList(ctx, { shouldSendNotification: false });
  });
};

export default { configure };
