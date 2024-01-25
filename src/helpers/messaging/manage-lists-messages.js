import { Markup } from 'telegraf';
import tryEditing from 'wishlist-bot/helpers/messaging/try-editing';
import tryPinning from 'wishlist-bot/helpers/messaging/try-pinning';
import {
  sendMessageAndMarkItForMarkupRemove,
} from 'wishlist-bot/helpers/middlewares/remove-markup';

/**
 * Отправляемое сообщение с элементом списка
 * @typedef {[ FmtString, Markup<InlineKeyboardMarkup> ]} Message
 */

/**
 * Обновление содержания сообщений с опциональной отправкой сообщения об этом
 * @async
 * @function editMessages
 * @param {Context} ctx Контекст
 * @param {boolean} shouldSendNotification Признак необходимости отправки сообщения об обновлении
 * @param {Message[]} messages Новые сообщения со списком
 * @param {string} userid Идентификатор пользователя -- владельца списка
 */
const editMessages = async (ctx, shouldSendNotification, messages, userid) => {
  await Promise.all(
    ctx.session.persistent.lists[userid].messagesToEditIds.map((messageToEditId, i) => {
      if (i >= messages.length) {
        return ctx.deleteMessage(messageToEditId);
      }

      const message = messages[i];

      return tryEditing(
        ctx,
        ctx.chat.id,
        messageToEditId,
        undefined,
        ...message,
      );
    }),
  );

  if (shouldSendNotification) {
    await sendMessageAndMarkItForMarkupRemove(
      ctx,
      'reply',
      'Список обновлён',
      {
        ...Markup.inlineKeyboard([
          Markup.button.callback(
            'Отправить новые сообщения',
            `force_${
              userid === ctx.chat.id ? 'own_' : ''
            }list${
              userid === ctx.chat.id ? '' : ` ${userid}`
            }`,
          ),
        ]),
        reply_to_message_id: ctx.session.persistent.lists[userid].pinnedMessageId,
      },
    );
  }
};

/**
 * Обновление старых сообщений с элементами списка:
 * указание неактуальности и удаление встроенной клавиатуры
 * @async
 * @function editOutdatedMessages
 * @param {Context} ctx Контекст
 * @param {string} userid Идентификатор пользователя -- владельца списка
 * @param {FmtString | string} outdatedTitleMessageText Текст заглавного сообщения неактуального списка
 */
const editOutdatedMessages = (ctx, userid, outdatedTitleMessageText) => {
  return Promise.all([
    ...(ctx.session.persistent.lists[userid]?.pinnedMessageId ?
      [
        ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.session.persistent.lists[userid].pinnedMessageId,
          undefined,
          outdatedTitleMessageText,
        ),
      ] :
      []
    ),
    (ctx.session.persistent.lists[userid]?.messagesToEditIds ?? []).map((messagesToEditId) =>
      ctx.telegram.editMessageReplyMarkup(ctx.chat.id, messagesToEditId)
    ),
  ]);
};

/**
 * Открепление заглавного сообщения неактуального списка (при наличии)
 * и отправка и закрепление нового заглавного сообщения
 * @async
 * @function pinMessage
 * @param {Context} ctx Контекст
 * @param {string} userid Идентификатор пользователя -- владельца списка
 * @param {FmtString | string} titleMessageText Текст заглавного сообщения актуального списка
 */
const pinMessage = async (ctx, userid, titleMessageText) => {
  if (!!ctx.session.persistent.lists[userid]?.pinnedMessageId) {
    await tryPinning(ctx, 'unpinChatMessage', ctx.session.persistent.lists[userid].pinnedMessageId);
  }

  const messageToPin = await ctx.reply(titleMessageText);

  await tryPinning(ctx, 'pinChatMessage', messageToPin.message_id);

  return messageToPin;
};

/**
 * Обновление списка. По умолчанию -- обновление отправленных ранее сообщений.
 * При отсутствии возможности обновления или явном указании
 * необходимости отправки новых сообщений -- отправка новых сообщений
 * @async
 * @function manageListsMessages
 * @param {Context} ctx Контекст
 * @param {string} userid Идентификатор пользователя -- владельца списка
 * @param {Message[]} messages Новые сообщения со списком
 * @param {FmtString | string} titleMessageText Текст заглавного сообщения актуального списка
 * @param {FmtString | string} outdatedTitleMessageText Текст заглавного сообщения неактуального списка
 * @param {boolean} [shouldForceNewMessages=false] Признак необходимости отправки новых сообщений
 * @param {boolean} [shouldSendNotification=true] Признак необходимости отправки сообщения-уведомления об обновлении
 */
const manageListsMessages = async (
  ctx,
  userid,
  messages,
  titleMessageText,
  outdatedTitleMessageText,
  shouldForceNewMessages = false,
  shouldSendNotification = true,
) => {
  if (
    !shouldForceNewMessages &&
    (ctx.session.persistent.lists[userid]?.messagesToEditIds?.length ?? -1) >= messages.length
  ) {
    await tryPinning(ctx, 'pinChatMessage', ctx.session.persistent.lists[userid].pinnedMessageId);
    await editMessages(ctx, shouldSendNotification, messages, userid);
    ctx.session.persistent.lists[userid].messagesToEditIds.length = messages.length;
    return;
  }

  await editOutdatedMessages(ctx, userid, outdatedTitleMessageText);

  const pinnedMessage = await pinMessage(ctx, userid, titleMessageText);

  ctx.session.persistent.lists[userid] = {
    pinnedMessageId: pinnedMessage.message_id,
    messagesToEditIds: [],
  };

  for (const message of messages) {
    const sentMessage = await ctx.reply(...message);
    ctx.session.persistent.lists[userid].messagesToEditIds.push(sentMessage.message_id);
  }
};

export default manageListsMessages;
