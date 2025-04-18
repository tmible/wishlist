import { inject } from '@tmible/wishlist-common/dependency-injector';
import { Markup } from 'telegraf';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import getUseridFromInput from '@tmible/wishlist-bot/helpers/get-userid-from-input';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import isUserInChat from '@tmible/wishlist-bot/helpers/is-user-in-chat';
import { sendMessageAndMarkItForMarkupRemove } from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';
import sendList from './helpers/send-list.js';

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
 * Проверки возможности отправки списка желаний
 * 1. Список желаний не отправляется в группу, если владелец списка есть в ней;
 * 2. Собственный список желаний отправляется пользователю только не в группе;
 *    эта проверка выпускает событие получения собственного списка и считается проваленной;
 * @function handleListCommand
 * @param {EventBus} eventBus Шина событий
 * @param {Context} ctx Контекст
 * @param {number} [userid] Идентификатор пользователя, список желаний которого запрашивается
 * @returns {Promise<boolean>} Признак успешного прохождения всех проверок
 * @async
 */
const handleListCommand = async (eventBus, ctx, userid) => {
  if (await isUserInChat(ctx, userid)) {
    await ctx.reply('Этот пользователь есть в этой группе!');
    return false;
  }

  if (userid === ctx.from.id) {
    if (isChatGroup(ctx)) {
      return false;
    }
    await eventBus.emit(Events.Wishlist.HandleOwnList, ctx);
    return false;
  }

  return true;
};

/**
 * Запуск [проверок]{@link handleListCommand} и при их прохождении,
 * если у команды нет полезной нагрузки, бот отправляет сообщение-приглашение для отправки
 * идентификатора или имени пользователя, список желаний которого запрашивается,
 * иначе бот [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
 * @function listCommandHandler
 * @param {EventBus} eventBus Шина событий
 * @param {Context} ctx Контекст
 * @returns {Promise<void>}
 * @async
 */
const listCommandHandler = async (eventBus, ctx) => {
  const [ userid, username ] = getUseridFromInput(eventBus, ctx.payload);

  if (!(await handleListCommand(eventBus, ctx, userid))) {
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

  await sendList(eventBus, ctx, userid, username, { shouldSendNotification: true });
};

/**
 * При прохождении [проверок]{@link handleListCommand}, бот
 * [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
 * @function listLinkHandler
 * @param {EventBus} eventBus Шина событий
 * @param {Context} ctx Контекст
 * @param {string} hash Хэш пользователя -- владельца списка
 * @returns {Promise<void>}
 * @async
 */
const listLinkHandler = async (eventBus, ctx, hash) => {
  const [ userid, username ] = eventBus.emit(Events.Usernames.GetUseridAndUsernameByHash, hash);

  if (!(await handleListCommand(eventBus, ctx, userid))) {
    return;
  }

  await sendList(eventBus, ctx, userid, username, { shouldSendNotification: true });
};

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  const eventBus = inject(InjectionToken.EventBus);

  /** При получении команды /list вызов {@link listCommandHandler} */
  bot.command('list', async (ctx) => await listCommandHandler(eventBus, ctx));

  /**
   * При вызове действия обновления списка желаний бот
   * [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
   */
  bot.action(/^update_list (\d+)$/, async (ctx) => await sendList(
    eventBus,
    ctx,
    Number.parseInt(ctx.match[1]),
    eventBus.emit(Events.Usernames.GetUsernameByUserid, Number.parseInt(ctx.match[1])),
    { shouldSendNotification: true },
  ));

  /**
   * При вызове действия отправки списка желаний новыми сообщениями бот
   * [отправляет список новыми сообщениями (см. параметр shouldForceNewMessages)]{@link sendList}
   */
  bot.action(/^force_list (\d+)$/, async (ctx) => await sendList(
    eventBus,
    ctx,
    Number.parseInt(ctx.match[1]),
    eventBus.emit(Events.Usernames.GetUsernameByUserid, Number.parseInt(ctx.match[1])),
    { shouldForceNewMessages: true },
  ));

  /**
   * При вызове действия ручного обновления внешне изменённого списка желаний бот
   * [
   *   отправляет список новыми сообщениями (см. параметры shouldForceNewMessages и isManualUpdate)
   * ]{@link sendList}
   */
  bot.action(/^manual_update (\d+)$/, async (ctx) => await sendList(
    eventBus,
    ctx,
    Number.parseInt(ctx.match[1]),
    eventBus.emit(Events.Usernames.GetUsernameByUserid, Number.parseInt(ctx.match[1])),
    { shouldForceNewMessages: true, isManualUpdate: true },
  ));

  /** При выпуске действия обработки ссылки на список желаний запуск {@link listLinkHandler} */
  eventBus.subscribe(
    Events.Wishlist.HandleListLink,
    async (ctx, hash) => await listLinkHandler(eventBus, ctx, hash),
  );
};

/** @type {ModuleMessageHandler} */
const messageHandler = (bot) => {
  const eventBus = inject(InjectionToken.EventBus);

  /**
   * При получении сообщения от пользователя, если ожидается идентификатор или имя пользователя,
   * список желаний которого запрашивается, полученный идентификатор или имя
   * [извлекаются]{@link getUseridFromInput} из сообщения, и, если все
   * [проверки]{@link handleListCommand} проходятся, бот
   * [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
   */
  bot.on('message', async (ctx, next) => {
    if (ctx.session.messagePurpose?.type === MessagePurposeType.WishlistOwnerUsername) {
      delete ctx.session.messagePurpose;

      const [ userid, username ] = getUseridFromInput(eventBus, ctx.message.text);

      if (!(await handleListCommand(eventBus, ctx, userid))) {
        return;
      }

      await sendList(eventBus, ctx, userid, username, { shouldSendNotification: true });
      return;
    }

    await next();
  });
};

export default { configure, messageHandler };
