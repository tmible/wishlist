import { Markup } from 'telegraf';
import MessagePurposeType from 'wishlist-bot/constants/message-purpose-type';
import getUseridFromInput from 'wishlist-bot/helpers/get-userid-from-input';
import isChatGroup from 'wishlist-bot/helpers/is-chat-group';
import {
  sendMessageAndMarkItForMarkupRemove,
} from 'wishlist-bot/helpers/middlewares/remove-markup';
import Events from 'wishlist-bot/store/events';

/**
 * Проверка возможности отправки сообщений указанному адресату и,
 * в случае успеха, отправка сообщения-приглашения для отправки сообщения,
 * копия которого будет отправлена адресату
 * @async
 * @function handleAnonymousMessage
 * @param {Context} ctx Контекст
 */
const handleAnonymousMessage = async (ctx) => {
  const [ chatId ] = getUseridFromInput(ctx.payload || ctx.message.text);

  if (!chatId) {
    return ctx.sendMessage('Я не могу отправить сообщение этому адресату ☹️');
  }

  ctx.session.messagePurpose = {
    type: MessagePurposeType.AnonymousMessage,
    payload: chatId,
  };

  await sendMessageAndMarkItForMarkupRemove(
    ctx,
    'reply',
    `Напишите сообщение${
      isChatGroup(ctx) ? ' ответом на это' : ''
    }, и я анонимно отправлю его`,
    Markup.inlineKeyboard([ Markup.button.callback('Не отправлять сообщение', 'cancel_message') ]),
  );
};

/**
 * При получении команды /message, запускающей процесс отправки анонимного сообщения:
 * 1) Если у неё нет полезной нагрузки, бот отправляет пользователю сообщение-приглашение
 * для указания адресата,
 * 2) Если полезная нагрузка есть, см. {@link handleAnonymousMessage}
 */
const configure = (bot) => {
  bot.command('message', async (ctx) => {
    if (!ctx.payload) {
      ctx.session.messagePurpose = { type: MessagePurposeType.AnonymousMessageRecieverUsername };

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

/**
 * При получении сообщения от пользователя, если ожидается сообщение для анонимной отправки,
 * копия полученного сообщения отправляется адресату
 */
const messageHandler = (bot) => {
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.AnonymousMessageRecieverUsername) {
      delete ctx.session.messagePurpose;
      return handleAnonymousMessage(ctx);
    }

    if (ctx.session.messagePurpose?.type === MessagePurposeType.AnonymousMessage) {
      await ctx.telegram.sendCopy(
        parseInt(ctx.session.messagePurpose.payload),
        ctx.message,
        Markup.inlineKeyboard([
          Markup.button.callback('Ответить', `answer ${ctx.chat.id} ${ctx.message.message_id}`),
        ]),
      );

      delete ctx.session.messagePurpose;
      return ctx.reply('Сообщение отправлено!');
    }

    return next();
  });
};

export default { configure, messageHandler };
