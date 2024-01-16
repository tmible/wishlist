import { Markup } from 'telegraf';
import UsernameRegexp from 'wishlist-bot/constants/username-regexp';
import isChatGroup from 'wishlist-bot/helpers/is-chat-group';
import { sendMessageAndMarkItForMarkupRemove } from 'wishlist-bot/helpers/remove-markup';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';

const handleAnonymousMessage = async (ctx) => {
  const chatId = await emit(
    Events.Usernames.GetUseridByUsername,
    UsernameRegexp.exec(ctx.payload || ctx.message.text)[1]
  );

  if (!chatId) {
    return ctx.sendMessage('Я не могу отправить сообщение этому адресату ☹️');
  }

  ctx.session.anonymousMessageChatId = chatId;

  await sendMessageAndMarkItForMarkupRemove(
    ctx,
    'reply',
    `Напишите сообщение${
      isChatGroup(ctx) ? ' ответом на это' : ''
    }, и я анонимно отправлю его`,
    Markup.inlineKeyboard([ Markup.button.callback('Не отправлять сообщение', 'cancel_message') ]),
  );
};

const configure = (bot) => {
  bot.command('message', async (ctx) => {
    if (!ctx.payload) {
      ctx.session.waitingForUsernameForMessage = true;

      await sendMessageAndMarkItForMarkupRemove(
        ctx,
        'reply',
        `Не указано имя пользователя. Кому вы хотите отправить анонимное сообщение?${
          isChatGroup(ctx) ? '\nНапишите его ответом на это сообщение' : ''
        }`,
        Markup.inlineKeyboard([
          Markup.button.callback('Не отправлять сообщение', 'cancel_message'),
        ]),
      );

      return;
    }

    await handleAnonymousMessage(ctx);
  });
};

const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session.waitingForUsernameForMessage) {
      delete ctx.session.waitingForUsernameForMessage;
      return handleAnonymousMessage(ctx);
    }

    if (ctx.session.anonymousMessageChatId) {
      await ctx.telegram.sendCopy(
        parseInt(ctx.session.anonymousMessageChatId),
        ctx.message,
        Markup.inlineKeyboard([
          Markup.button.callback('Ответить', `answer ${ctx.chat.id} ${ctx.message.message_id}`),
        ]),
      );

      delete ctx.session.anonymousMessageChatId;
      return ctx.reply('Сообщение отправлено!');
    }

    return next();
  });
};

export default { configure, messageHandler };
