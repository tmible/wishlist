import { Markup } from 'telegraf';
import getUseridFromInput from 'wishlist-bot/helpers/get-userid-from-input';
import isChatGroup from 'wishlist-bot/helpers/is-chat-group';
import { sendMessageAndMarkItForMarkupRemove } from 'wishlist-bot/helpers/remove-markup';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';

const handleAnonymousMessage = async (ctx) => {
  const [ chatId ] = await getUseridFromInput(ctx.payload || ctx.message.text);

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
        `Кому вы хотите отправить анонимное сообщение?\nОтправьте мне имя или идентификатор пользователя${
          isChatGroup(ctx) ? ' ответом на это сообщение' : ''
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
