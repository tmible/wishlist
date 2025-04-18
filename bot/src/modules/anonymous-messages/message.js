import { inject } from '@tmible/wishlist-common/dependency-injector';
import { Markup } from 'telegraf';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import getUseridFromInput from '@tmible/wishlist-bot/helpers/get-userid-from-input';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import { sendMessageAndMarkItForMarkupRemove } from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';

/**
 * @typedef {import('telegraf').Context} Context
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleMessageHandler
 * } ModuleMessageHandler
 * @typedef {import('@tmible/wishlist-common/event-bus').EventBus} EventBus
 */

/**
 * Проверка возможности отправки сообщений указанному адресату и,
 * в случае успеха, отправка сообщения-приглашения для отправки сообщения,
 * копия которого будет отправлена адресату
 * @function handleAnonymousMessage
 * @param {EventBus} eventBus Шина событий
 * @param {Context} ctx Контекст
 * @returns {Promise<void>}
 * @async
 */
const handleAnonymousMessage = async (eventBus, ctx) => {
  const [ chatId ] = getUseridFromInput(eventBus, ctx.payload || ctx.message.text);

  if (!chatId) {
    await ctx.sendMessage('Я не могу отправить сообщение этому адресату ☹️');
    return;
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
    Markup.inlineKeyboard([
      Markup.button.callback('Не отправлять сообщение', 'cancel_message'),
    ]),
  );
};

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  const eventBus = inject(InjectionToken.EventBus);

  /**
   * При получении команды /message, запускающей процесс отправки анонимного сообщения:
   * 1. Если у неё нет полезной нагрузки, бот отправляет пользователю сообщение-приглашение
   * для указания адресата;
   * 2. Если полезная нагрузка есть, см. {@link handleAnonymousMessage}.
   */
  bot.command('message', async (ctx) => {
    if (!ctx.payload) {
      ctx.session.messagePurpose = { type: MessagePurposeType.AnonymousMessageRecieverUsername };

      await sendMessageAndMarkItForMarkupRemove(
        ctx,
        'reply',
        'Кому вы хотите отправить анонимное сообщение?\n' +
          `Отправьте мне имя или идентификатор пользователя${
            isChatGroup(ctx) ? ' ответом на это сообщение' : ''
          }`,
        Markup.inlineKeyboard([
          Markup.button.callback('Не отправлять сообщение', 'cancel_message'),
        ]),
      );

      return;
    }

    await handleAnonymousMessage(eventBus, ctx);
  });
};

/** @type {ModuleMessageHandler} */
const messageHandler = (bot) => {
  const eventBus = inject(InjectionToken.EventBus);

  /**
   * При получении сообщения от пользователя, если ожидается сообщение для анонимной отправки,
   * копия полученного сообщения отправляется адресату
   */
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.AnonymousMessageRecieverUsername) {
      delete ctx.session.messagePurpose;
      return handleAnonymousMessage(eventBus, ctx);
    }

    if (ctx.session.messagePurpose?.type === MessagePurposeType.AnonymousMessage) {
      await ctx.telegram.sendCopy(
        ctx.session.messagePurpose.payload,
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
