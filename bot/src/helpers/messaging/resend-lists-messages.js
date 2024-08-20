import { Markup } from 'telegraf';
import tryPinning from '@tmible/wishlist-bot/helpers/messaging/try-pinning';

/**
 * @typedef {import('telegraf').Context} Context
 * @typedef {import('telegraf').Format} Format
 * @typedef {
 *   import('@tmible/wishlist-bot/helpers/messaging/form-foreign-list-messages').Message
 * } Message
 * @typedef {
 *   import('@tmible/wishlist-bot/helpers/messaging/manage-lists-messages').SendListOptions
 * } SendListOptions
 */

/**
 * Обновление старых сообщений с элементами списка:
 * указание неактуальности и удаление встроенной клавиатуры
 * @function editOutdatedMessages
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {Format.FmtString | string} outdatedTitleMessageText Текст заглавного сообщения
 *   неактуального списка
 * @param {SendListOptions} options Параметры отправки списка
 * @returns {Promise<void>}
 */
const editOutdatedMessages = (ctx, userid, outdatedTitleMessageText, options) => Promise.all([
  ...(ctx.session.persistent.lists[userid]?.pinnedMessageId ?
    [
      ctx.telegram.editMessageText(
        ctx.chat.id,
        ctx.session.persistent.lists[userid].pinnedMessageId,
        undefined,
        outdatedTitleMessageText,
        ...(options.isAutoUpdate ?
          [
            Markup.inlineKeyboard([
              Markup.button.callback('🔄 Обновить', `manual_update ${userid}`),
            ]),
          ] :
          []
        ),
      ),
    ] :
    []
  ),
  ...(
    options.isManualUpdate ?
      [] :
      ctx.session.persistent.lists[userid]?.messagesToEdit ?? []
  ).map(({ id }) => ctx.telegram.editMessageReplyMarkup(ctx.chat.id, id)),
]);

/**
 * Открепление заглавного сообщения неактуального списка (при наличии)
 * и отправка и закрепление нового заглавного сообщения
 * @function pinMessage
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {Format.FmtString | string} titleMessageText Текст заглавного сообщения актуального списка
 * @returns {{ message_id: number } & Record<string, unknown>} Новое заглавное сообщение
 * @async
 */
const pinMessage = async (ctx, userid, titleMessageText) => {
  if (ctx.session.persistent.lists[userid]?.pinnedMessageId) {
    await tryPinning(ctx, false, ctx.session.persistent.lists[userid].pinnedMessageId);
  }

  const messageToPin = await ctx.reply(
    titleMessageText,
    Markup.inlineKeyboard([[
      Markup.button.callback(
        '🔄 Обновить',
        userid === ctx.chat.id ? 'update_own_list' : `update_list ${userid}`,
      ),
    ], [
      Markup.button.callback(
        '💬 Отправить новые сообщения',
        userid === ctx.chat.id ? 'force_own_list' : `force_list ${userid}`,
      ),
    ]]),
  );

  await tryPinning(ctx, true, messageToPin.message_id);

  return messageToPin;
};

/**
 * Обновление списка. [Обновление отправленных ранее сообщений]{@link editOutdatedMessages},
 * отправка новых сообщений
 * @function resendListsMessages
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {Message[]} messages Новые сообщения со списком
 * @param {Format.FmtString | string} titleMessageText Текст заглавного сообщения актуального списка
 * @param {Format.FmtString | string} outdatedTitleMessageText Текст заглавного сообщения
 *   неактуального списка
 * @param {SendListOptions} options Параметры отправки списка
 * @async
 */
const resendListsMessages = async (
  ctx,
  userid,
  messages,
  titleMessageText,
  outdatedTitleMessageText,
  options,
) => {
  await editOutdatedMessages(ctx, userid, outdatedTitleMessageText, options);

  if (options.isAutoUpdate) {
    return;
  }

  const pinnedMessage = await pinMessage(ctx, userid, titleMessageText);

  /* eslint-disable-next-line require-atomic-updates --
    Даже после редактирования и закрепления сообщений персистентная сессия определена в контексте
  */
  ctx.session.persistent.lists[userid] = {
    pinnedMessageId: pinnedMessage.message_id,
    messagesToEdit: [],
  };

  for (const { itemId, message } of messages) {
    const sentMessage = await ctx.reply(...message);
    ctx.session.persistent.lists[userid].messagesToEdit.push({
      id: sentMessage.message_id,
      itemId,
      text: sentMessage.text,
      entities: sentMessage.entities,
      reply_markup: sentMessage.reply_markup,
    });
  }
};

export default resendListsMessages;
