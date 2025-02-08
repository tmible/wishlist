import resendListsMessages from '@tmible/wishlist-bot/helpers/messaging/resend-lists-messages';
import updateListsMessages from '@tmible/wishlist-bot/helpers/messaging/update-lists-messages';

/**
 * @typedef {import('telegraf').Context} Context
 * @typedef {import('telegraf').Format} Format
 * @typedef {import('telegraf').InlineKeyboardMarkup} InlineKeyboardMarkup
 * @typedef {import('telegraf').Markup} Markup
 * @typedef {
 *   import('@tmible/wishlist-bot/helpers/messaging/form-foreign-list-messages').Message
 * } Message
 * @typedef {import('@tmible/wishlist-bot/store').Entity} Entity
 */
/**
 * Сохраняемая в персистентной сессии информация об отправленном сообщении с элементом списка
 * @typedef {object} MessageToEdit
 * @property {number} id Идентификатор сообщения
 * @property {number} itemId Идентификатор ассоциированного элемента списка
 * @property {string} text Текст сообщения
 * @property {Entity[]} entities Элементы разметки текста сообщения
 * @property {Markup<InlineKeyboardMarkup>['reply_markup']} reply_markup Встроенная клавиатура
 *   сообщения
 */
/**
 * Параметры отправки списка
 * @typedef {object} SendListOptions
 * @property {boolean} shouldForceNewMessages Признак необходимости отправки новых сообщений
 * @property {boolean} shouldSendNotification Признак необходимости отправки
 *   сообщения-уведомления об обновлении
 * @property {boolean} isAutoUpdate Признак автоматического обновления списка при внешних изменениях
 * @property {boolean} isManualUpdate Признак ручного обновления списка после внешних изменений
 *   при невозможности автоматического
 */

/**
 * Значения параметров отправки списка по умолчанию
 * @constant {SendListOptions}
 */
const defaultOptions = {
  shouldForceNewMessages: false,
  shouldSendNotification: true,
  isAutoUpdate: false,
  isManualUpdate: false,
};

/**
 * Обновление списка. По умолчанию -- обновление отправленных ранее сообщений.
 * При отсутствии возможности обновления или явном указании
 * необходимости отправки новых сообщений -- отправка новых сообщений
 * @function manageListsMessages
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {Message[]} messages Новые сообщения со списком
 * @param {Format.FmtString | string} titleMessageText Текст заглавного сообщения актуального списка
 * @param {Format.FmtString | string} outdatedTitleMessageText Текст заглавного сообщения
 *   неактуального списка
 * @param {SendListOptions} passedOptions Параметры отправки списка
 * @async
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

  if (!options.isAutoUpdate && !options.isManualUpdate && !options.shouldForceNewMessages) {
    ctx.state.autoUpdate = { userid };
  } else if (options.isManualUpdate) {
    ctx.state.autoUpdate = { shouldAddChat: userid };
  }

  if (
    !options.shouldForceNewMessages &&
    (ctx.session.persistent.lists[userid]?.messagesToEdit.length ?? -1) >= messages.length
  ) {
    await updateListsMessages(
      ctx,
      userid,
      messages,
      titleMessageText,
      options.shouldSendNotification,
    );
    return;
  }

  await resendListsMessages(
    ctx,
    userid,
    messages,
    titleMessageText,
    outdatedTitleMessageText,
    options,
  );

  if (options.isAutoUpdate) {
    ctx.state.autoUpdate = { shouldRemoveChat: true };
  }
};

export default manageListsMessages;
