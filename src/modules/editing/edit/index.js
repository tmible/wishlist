import TmibleId from 'wishlist-bot/constants/tmible-id';
import sendList from '../helpers/send-list.js';

const configure = (bot) => {
  bot.command('edit', async (ctx) => {
    if (ctx.update.message.chat.id !== TmibleId) {
      return;
    }
    await sendList(ctx);
  });
};

export default { configure };
