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

/**
 * Проверки возможности отправки списка желаний
 * 1. Список желаний не отправляется в группу, если владелец списка есть в ней;
 * 2. Собственный список желаний отправляется пользователю только не в группе;
 *    эта проверка [выпускает]{@link emit} событие получения собственного списка и считается проваленной;
 * @async
 * @function handleListCommand
 * @param {Context} ctx Контекст
 * @param {string} [userid] Идентификатор пользователя, список желаний которого запрашивается
 * @returns {boolean} Признак успешного прохождения всех проверок
 */
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

/**
 * При получении команды /list запуск [проверок]{@link handleListCommand} и при их прохождении,
 * если у команды нет полезной нагрузки, бот отправляет сообщение-приглашение для отправки
 * идентификатора или имени пользователя, список желаний которого запрашивается,
 * иначе бот [отправлает обновлённый или обновляет отправленный ранее список]{@link sendList}
 *
 * При вызове действия отправки списка желаний новыми сообщениями бот
 * [отправляет список новыми сообщениями (см. аргумент shouldForceNewMessages)]{@link sendList}
 */
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

/**
 * При получении сообщения от пользователя, если ожидается идентификатор или имя пользователя,
 * список желаний которого запрашивается, полученный идентификатор или имя [извлекаются]{@link getUseridFromInput} из сообщения,
 * и, если все [проверки]{@link handleListCommand} проходятся, бот
 * [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
 */
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
