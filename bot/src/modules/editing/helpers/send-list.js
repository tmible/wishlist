import { Format, Markup } from 'telegraf';
import Events from '@tmible/wishlist-bot/architecture/events';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import manageListsMessages from '@tmible/wishlist-bot/helpers/messaging/manage-lists-messages';

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
  const categoryBlock = item.category ? `\n\n🔡 ${item.category}` : '';
  const descriptionOffset = `${item.name}\n`.length;
  const description = item.description ? `\n${item.description}` : '';

  return new Format.FmtString(
    `${item.name}${description}${categoryBlock}`,
    [
      ...item.descriptionEntities.map((entity) => ({
        ...entity,
        offset: entity.offset + descriptionOffset,
      })),
      { offset: 0, length: item.name.length, type: 'bold' },
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
  Markup.button.callback('Удалить', `delete ${item.id}`),
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

  await manageListsMessages(
    ctx,
    userid,
    messages,
    Format.join(
      messages.length === 0 ?
        [
          'Ваш список пуст',
          new Format.FmtString(
            'Вы можете добавить в него свои желания на портале',
            [{ offset: 42, length: 7, type: 'text_link', url: 'https://wishlist.tmible.ru/list' }],
          ),
        ] :
        [
          'Ваш актуальный список',
          new Format.FmtString(
            'Полноценное редактирование своего списка доступно на портале',
            [{ offset: 53, length: 7, type: 'text_link', url: 'https://wishlist.tmible.ru/list' }],
          ),
        ],
      '\n\n',
    ),
    'Ваш неактуальный список',
    {
      ...defaultOptions,
      ...passedOptions,
    },
  );
};

export default sendList;
