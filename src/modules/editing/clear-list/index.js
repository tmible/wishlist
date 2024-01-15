import { Markup } from 'telegraf';
import { sendMessageAndMarkItForMarkupRemove } from 'wishlist-bot/helpers/remove-markup';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

const configure = (bot) => {
  bot.command('clear_list', async (ctx) => {
    ctx.session.clearList = true;
    await sendMessageAndMarkItForMarkupRemove(
      ctx,
      'reply',
      'Отправьте мне список id позиций, которые нужно удалить',
      Markup.inlineKeyboard([
        Markup.button.callback('Не очищать список', 'cancel_clear_list'),
      ]),
    );
  });
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session.clearList) {
      const ids = ctx.update.message.text.split(/[^\d]+/).filter((id) => !!id);
      delete ctx.session.clearList;

      if (ids.length === 0) {
        return ctx.reply('Не могу найти ни одного id');
      }

      await emit(Events.Editing.DeleteItems, ids);

      await ctx.reply('Список очищен!');
      await sendList(ctx);
      return;
    }

    return next();
  });
};

export default { configure, messageHandler };
