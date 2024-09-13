import { Format, Markup } from 'telegraf';
import Events from '@tmible/wishlist-bot/architecture/events';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import manageListsMessages from '@tmible/wishlist-bot/helpers/messaging/manage-lists-messages';
import digitToEmoji from '@tmible/wishlist-bot/utils/digit-to-emoji';

/**
 * @typedef {import('telegraf').Context} Context
 * @typedef {import('telegraf').InlineKeyboardMarkup} InlineKeyboardMarkup
 * @typedef {import('@tmible/wishlist-bot/architecture/event-bus').EventBus} EventBus
 * @typedef {import('@tmible/wishlist-bot/store/editing/get-list').OwnListItem} OwnListItem
 * @typedef {
 *   import('@tmible/wishlist-bot/helpers/messaging/manage-lists-messages').SendListOptions
 * } SendListOptions
 */

/**
 * Формирование текст сообщения с элементом собственного списка желаний
 * @function formText
 * @param {OwnListItem} item Элемент списка желаний
 * @returns {Format.FmtString} Текст сообщения
 */
const formText = (item) => {
  const idLine = `id: ${item.id}`;
  const priorityBlock = digitToEmoji(item.priority);
  const priorityAndNameLine = `${priorityBlock} ${item.name}`;
  const nameOffset = `${idLine}\n${priorityBlock} `.length;
  const descriptionOffset = `${idLine}\n${priorityAndNameLine}\n`.length;
  const description = item.description ? `\n${item.description}` : '';

  return new Format.FmtString(
    `${idLine}\n${priorityAndNameLine}${description}`,
    [
      ...item.descriptionEntities.map((entity) => ({
        ...entity,
        offset: entity.offset + descriptionOffset,
      })),
      { offset: 0, length: idLine.length, type: 'italic' },
      { offset: nameOffset, length: item.name.length, type: 'bold' },
    ],
  );
};

/**
 * Формирование встроенной клавиатуры для сообщения с элементом собственного списка желаний
 * @function formReplyMarkup
 * @param {OwnListItem} item Элемент списка желаний
 * @returns {Markup<InlineKeyboardMarkup>[]} Встроенная клавиатура
 */
const formReplyMarkup = (item) => Markup.inlineKeyboard([
  [ Markup.button.callback('Изменить приоритет', `update_priority ${item.id}`) ],
  [ Markup.button.callback('Изменить название', `update_name ${item.id}`) ],
  [ Markup.button.callback('Изменить описание', `update_description ${item.id}`) ],
  [ Markup.button.callback('Удалить', `delete ${item.id}`) ],
]);

/**
 * Значения параметров отправки списка по умолчанию
 * @constant {SendListOptions}
 */
const defaultOptions = {
  shouldForceNewMessages: false,
  shouldSendNotification: true,
};

/**
 * [Отправка (или обновление уже отправленных сообщений)]{@link manageListsMessages}
 * собственного списка желаний пользователя, при его наличии и при условии, что чат не групповой.
 * При отсутствии желаний пользователя отправляется сообщение об этом
 * @function sendList
 * @param {EventBus} eventBus Шина событий
 * @param {Context} ctx Контекст
 * @param {SendListOptions} passedOptions Параметры отправки списка
 *   (см. аргумент passedOptions {@link manageListsMessages})
 * @returns {Promise<void>} Отправка сообщений
 * @async
 */
const sendList = async (eventBus, ctx, passedOptions = {}) => {
  if (isChatGroup(ctx)) {
    return;
  }

  const userid = ctx.chat.id;

  const messages = eventBus
    .emit(Events.Editing.GetList, userid)
    .map((item) => ({
      itemId: item.id,
      message: [ formText(item), formReplyMarkup(item) ],
    }));

  if (messages.length === 0) {
    await ctx.reply(
      'Ваш список пуст. Вы можете добавить в него что-нибудь с помощью команды /add',
    );
    return;
  }

  await manageListsMessages(
    ctx,
    userid,
    messages,
    'Ваш актуальный список',
    'Ваш неактуальный список',
    {
      ...defaultOptions,
      ...passedOptions,
    },
  );
};

export default sendList;
