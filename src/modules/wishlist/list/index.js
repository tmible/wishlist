import { Markup } from 'telegraf';
import UsernameRegexp from 'wishlist-bot/constants/username-regexp';
import { sendMessageAndMarkItForMarkupRemove } from 'wishlist-bot/helpers/remove-markup';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

const configure = (bot) => {
  bot.command('list', async (ctx) => {
    if (ctx.update.message.chat.type === 'group') {
      return;
    }

    const username = UsernameRegexp.exec(ctx.payload)?.[1];

    if (username === ctx.message.chat.username) {
      return emit(Events.Wishlist.HandleOwnList, ctx);
    }

    if (!ctx.payload) {
      ctx.session.waitingForUsernameForList = true;
      return sendMessageAndMarkItForMarkupRemove(
        ctx,
        'reply',
        'Не указано имя пользователя. Чей список вы хотите посмотреть?',
        Markup.inlineKeyboard([
          [ Markup.button.callback('Не смотреть список', 'cancel_list') ],
        ]),
      );
    }

    await sendList(ctx, 'message', username, false, true);
  });

  bot.action(
    /^force_list ([a-z0-9_]+)$/,
    (ctx) => sendList(ctx, 'callback_query', ctx.match[1], true),
  );
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.update.message.chat.type === 'group') {
      return next();
    }

    if (ctx.session.waitingForUsernameForList) {
      delete ctx.session.waitingForUsernameForList;
      const username = UsernameRegexp.exec(ctx.message.text)[1];

      if (username === ctx.message.chat.username) {
        return emit(Events.Wishlist.HandleOwnList, ctx);
      }

      await sendList(ctx, 'message', username, false, true);
      return;
    }

    return next();
  });
};

export default { configure, messageHandler };
