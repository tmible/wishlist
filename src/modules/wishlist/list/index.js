import { Markup } from 'telegraf';
import UsernameRegexp from 'wishlist-bot/constants/username-regexp';
import isChatGroup from 'wishlist-bot/helpers/is-chat-group';
import { sendMessageAndMarkItForMarkupRemove } from 'wishlist-bot/helpers/remove-markup';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

const handleListCommand = async (ctx, username) => {
  const userid = await emit(Events.Usernames.GetUseridByUsername, username);
  if (!!userid && isChatGroup(ctx) && !!(await ctx.getChatMember(userid))) {
    await ctx.reply('Этот пользователь есть в этой группе!');
    return false;
  }

  if (username === ctx.from.username) {
    if (isChatGroup(ctx)) {
      return false;
    }
    await emit(Events.Wishlist.HandleOwnList, ctx);
    return false;
  }

  return true;
};

const configure = (bot) => {
  bot.command('list', async (ctx) => {
    const username = UsernameRegexp.exec(ctx.payload)?.[1];

    if (!(await handleListCommand(ctx, username))) {
      return;
    }

    if (!ctx.payload) {
      ctx.session.waitingForUsernameForList = true;

      await sendMessageAndMarkItForMarkupRemove(
        ctx,
        'reply',
        `Не указано имя пользователя. Чей список вы хотите посмотреть?${
          isChatGroup(ctx) ? '\nНапишите его ответом на это сообщение' : ''
        }`,
        Markup.inlineKeyboard([
          [ Markup.button.callback('Не смотреть список', 'cancel_list') ],
        ]),
      );

      return;
    }

    await sendList(ctx, username, false, true);
  });

  bot.action(/^force_list ([a-z0-9_]+)$/, (ctx) => sendList(ctx, ctx.match[1], true));
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session.waitingForUsernameForList) {
      delete ctx.session.waitingForUsernameForList;

      const username = UsernameRegexp.exec(ctx.message.text)[1];

      if (!(await handleListCommand(ctx, username))) {
        return;
      }

      await sendList(ctx, username, false, true);
      return;
    }

    return next();
  });
};

export default { configure, messageHandler };
