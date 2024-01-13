import TmibleId from 'wishlist-bot/constants/tmible-id';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

const configure = (bot) => {
  bot.action(/^delete ([\-\d]+)$/, async (ctx) => {
    if (ctx.update.callback_query.message.chat.id !== TmibleId) {
      return;
    }

    await emit(Events.Editing.DeleteItems, [ ctx.match[1] ]);

    await ctx.reply('Удалено!');
    await sendList(ctx);
  });
};

export default { configure };
