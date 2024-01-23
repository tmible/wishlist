import { Markup } from 'telegraf';
import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import isChatGroup from 'wishlist-bot/helpers/is-chat-group';
import {
  sendMessageAndMarkItForMarkupRemove,
} from 'wishlist-bot/helpers/middlewares/remove-markup';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

const configure = (bot) => {
  bot.command('clear_list', async (ctx) => {
    if (isChatGroup(ctx)) {
      return;
    }

    ctx.session.messagePurpose = { type: MessagePurposeType.ClearList };
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
    if (ctx.session.messagePurpose?.type === MessagePurposeType.ClearList) {
      const ids = ctx.message.text.split(/[^\d]+/).filter((id) => !!id);
      delete ctx.session.messagePurpose;

      if (ids.length === 0) {
        return ctx.reply('Не могу найти ни одного id');
      }

      emit(Events.Editing.DeleteItems, ids);

      await ctx.reply('Список очищен!');
      await sendList(ctx);
      return;
    }

    return next();
  });
};

export default { configure, messageHandler };
