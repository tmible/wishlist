import { Markup } from 'telegraf';
import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import getUseridFromInput from 'wishlist-bot/helpers/get-userid-from-input';
import isChatGroup from 'wishlist-bot/helpers/is-chat-group';
import isUserInChat from 'wishlist-bot/helpers/is-user-in-chat';
import {
  sendMessageAndMarkItForMarkupRemove,
} from 'wishlist-bot/helpers/middlewares/remove-markup';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

const handleListCommand = async (ctx, userid) => {
  if (await isUserInChat(ctx, userid)) {
    await ctx.reply('Этот пользователь есть в этой группе!');
    return false;
  }

  if (userid === ctx.from.id) {
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
    const [ userid, username ] = getUseridFromInput(ctx.payload);

    if (!(await handleListCommand(ctx, userid))) {
      return;
    }

    if (!ctx.payload) {
      ctx.session.messagePurpose = { type: MessagePurposeType.WishlistOwnerUsername };

      await sendMessageAndMarkItForMarkupRemove(
        ctx,
        'reply',
        `Чей список вы хотите посмотреть?\nОтправьте мне имя или идентификатор пользователя${
          isChatGroup(ctx) ? ' ответом на это сообщение' : ''
        }`,
        Markup.inlineKeyboard([
          [ Markup.button.callback('Не смотреть список', 'cancel_list') ],
        ]),
      );

      return;
    }

    await sendList(ctx, userid, username, false, true);
  });

  bot.action(/^force_list ([0-9]+)$/, (ctx) => sendList(
    ctx,
    ctx.match[1],
    emit(Events.Usernames.GetUsernameByUserid, ctx.match[1]),
    true,
  ));
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.WishlistOwnerUsername) {
      delete ctx.session.messagePurpose;

      const [ userid, username ] = getUseridFromInput(ctx.message.text);

      if (!(await handleListCommand(ctx, userid))) {
        return;
      }

      await sendList(ctx, userid, username, false, true);
      return;
    }

    return next();
  });
};

export default { configure, messageHandler };
