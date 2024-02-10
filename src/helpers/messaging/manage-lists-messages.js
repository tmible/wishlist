import resendListsMessages from '@tmible/wishlist-bot/helpers/messaging/resend-lists-messages';
import updateListsMessages from '@tmible/wishlist-bot/helpers/messaging/update-lists-messages';

/**
 * Отправляемое сообщение с элементом списка
 * @typedef {[ FmtString, Markup<InlineKeyboardMarkup> ]} Message
 *
 * Параметры отправки списка
 * @typedef {Object} SendListOptions
 * @property {boolean} shouldForceNewMessages Признак необходимости отправки новых сообщений
 * @property {boolean} shouldSendNotification Признак необходимости отправки сообщения-уведомления об обновлении
 */

/**
 * Значения параметры отправки списка по умолчанию
 * @constant {SendListOptions}
 */
const defaultOptions = {
  shouldForceNewMessages: false,
  shouldSendNotification: true,
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
 * @param {SendListOptions} [passedOptions={}] Параметры отправки списка
 */
const manageListsMessages = async (
  ctx,
  userid,
  messages,
  titleMessageText,
  outdatedTitleMessageText,
  passedOptions = {},
) => {
  const options = {
    ...defaultOptions,
    ...passedOptions,
  };

  if (
    !options.shouldForceNewMessages &&
    (ctx.session.persistent.lists[userid]?.messagesToEdit.length ?? -1) >= messages.length
  ) {
    await updateListsMessages(ctx, userid, messages, options.shouldSendNotification);
    return;
  }

  await resendListsMessages(ctx, userid, messages, titleMessageText, outdatedTitleMessageText);
};

export default manageListsMessages;
