import TmibleId from 'wishlist-bot/constants/tmible-id';
import sendList from '../helpers/send-list.js';

const configure = (bot) => {
  bot.command('list', async (ctx) => {
    if (
      ctx.update.message.chat.type === 'group' ||
      ctx.update.message.chat.id === TmibleId
    ) {
      return;
    }
    await sendList(ctx, 'message');
  });
};

export default { configure };
