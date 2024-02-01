import resendListsMessages from 'wishlist-bot/helpers/messaging/resend-lists-messages';
import updateListsMessages from 'wishlist-bot/helpers/messaging/update-lists-messages';

/**
 * Отправляемое сообщение с элементом списка
 * @typedef {[ FmtString, Markup<InlineKeyboardMarkup> ]} Message
 */

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
    (ctx.session.persistent.lists[userid]?.messagesToEditIds.length ?? -1) >= messages.length
  ) {
    await updateListsMessages(ctx, userid, messages, shouldSendNotification);
    return;
  }

  await resendListsMessages(ctx, userid, messages, titleMessageText, outdatedTitleMessageText);
};

export default manageListsMessages;
