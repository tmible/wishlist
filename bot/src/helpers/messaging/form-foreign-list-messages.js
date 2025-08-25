import ListItemState from '@tmible/wishlist-common/constants/list-item-state';
import { Format, Markup } from 'telegraf';
import Events from '@tmible/wishlist-bot/architecture/events';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import getMentionFromUseridOrUsername from '@tmible/wishlist-bot/helpers/messaging/get-mention-from-userid-or-username';

/**
 * @typedef {import('telegraf').Context} Context
 * @typedef {import('telegraf').InlineKeyboardMarkup} InlineKeyboardMarkup
 * @typedef {import('telegraf').Hideable} Hideable
 * @typedef {import('telegraf').InlineKeyboardButton} InlineKeyboardButton
 * @typedef {import('@tmible/wishlist-common/event-bus').EventBus} EventBus
 * @typedef {import('@tmible/wishlist-bot/store/wishlist/get-list').ListItem} ListItem
 */
/**
 * Отправляемое сообщение с элементом списка
 * @typedef {object} Message
 * @property {number} itemId Идентификатор подарка, отображаемого в сообщении
 * @property {[ Format.FmtString, Markup<InlineKeyboardMarkup> ]} message
 *   Текст и элементы разметки текста сообщения
 */

/**
 * Формирование блока с упоминаниями забронировавего подарок пользователя
 * или участников кооперации по подарку
 * @function formParticipantsBlock
 * @param {ListItem} item Элемент списка желаний
 * @returns {Format.FmtString} Блок с упоминаниями
 */
const formParticipantsBlock = (item) => {
  if (item.participants.length === 0) {
    return new Format.FmtString('🟢 свободен');
  }

  const participantsMentions = item.participants.map(
    (username, i) => getMentionFromUseridOrUsername(item.participantsIds[i], username),
  );

  if (item.state === ListItemState.BOOKED) {
    return Format.join([ '🔴', 'забронирован', participantsMentions[0] ], ' ');
  }

  const cooperationPparticipants = Format.join(
    [ '🟡', 'участники:', Format.join(participantsMentions, ', ') ],
    ' ',
  );

  if (item.groupLink) {
    return Format.join([ cooperationPparticipants, `группа: ${item.groupLink}` ], '\n');
  }

  return cooperationPparticipants;
};

/**
 * Формирование блока с упоминанием пользователя, добавившего подарок в список
 * @function formAddedByBlock
 * @param {ListItem} item Элемент списка желаний
 * @returns {Format.FmtString} Блок с упоминанием
 */
const formAddedByBlock = (item) => {
  const addedByMention = getMentionFromUseridOrUsername(item.addedById, item.addedBy);
  return Format.join([ '❗️', 'добавлен:', addedByMention ], ' ');
};

/**
 * Формирование кнопки бронирования подарка
 * @function formBookButton
 * @param {Context} ctx Контекст
 * @param {ListItem} item Элемент списка желаний
 * @param {number} userid Идентификатор пользователя — владельца списка
 * @returns {Hideable<InlineKeyboardButton.CallbackButton>[]} Кнопка бронирования подарка
 */
const formBookButton = (ctx, item, userid) => (
  isChatGroup(ctx) || item.state === ListItemState.FREE ?
    [ Markup.button.callback('Забронировать', `book ${item.id} ${userid}`) ] :
    []
);

/**
 * Формирование кнопки участия в подарке
 * @function formCooperateButton
 * @param {Context} ctx Контекст
 * @param {ListItem} item Элемент списка желаний
 * @param {number} userid Идентификатор пользователя — владельца списка
 * @returns {Hideable<InlineKeyboardButton.CallbackButton>[]} Кнопка участия в подарке
 */
const formCooperateButton = (ctx, item, userid) => (
  (
    isChatGroup(ctx) ||
        item.state === ListItemState.FREE ||
        (
          item.state === ListItemState.COOPERATIVE &&
          !item.participantsIds.includes(ctx.from.id)
        )
  ) ?
    [ Markup.button.callback('Поучаствовать', `cooperate ${item.id} ${userid}`) ] :
    []
);

/**
 * Формирование кнопки отмены участия в кооперации по подарку или бронирования подарка
 * @function formRetireButton
 * @param {Context} ctx Контекст
 * @param {ListItem} item Элемент списка желаний
 * @param {number} userid Идентификатор пользователя — владельца списка
 * @returns {Hideable<InlineKeyboardButton.CallbackButton>[]}
 *   Кнопка отмены участия в кооперации или бронирования
 */
const formRetireButton = (ctx, item, userid) => (
  (
    isChatGroup(ctx) ||
        (
          item.state !== ListItemState.FREE &&
          item.participantsIds.includes(ctx.from.id)
        )
  ) ?
    [ Markup.button.callback('Отказаться', `retire ${item.id} ${userid}`) ] :
    []
);

/**
 * Формирование кнопки создания группы для кооперации по подарку
 * @function formCreateGroupButton
 * @param {Context} ctx Контекст
 * @param {ListItem} item Элемент списка желаний
 * @param {number} userid Идентификатор пользователя — владельца списка
 * @returns {Hideable<InlineKeyboardButton.CallbackButton>[]} Кнопка создания группы
 */
const formCreateGroupButton = (ctx, item, userid) => (
  (
    item.state === ListItemState.COOPERATIVE &&
      !item.groupLink &&
      (
        isChatGroup(ctx) ||
        item.participantsIds.includes(ctx.from.id)
      )
  ) ?
    [ Markup.button.callback('Создать группу', `create_group ${item.id} ${userid}`) ] :
    []
);

/**
 * Формирование кнопки привязки группы для кооперации к подарку
 * @function formBindGroupButton
 * @param {Context} ctx Контекст
 * @param {ListItem} item Элемент списка желаний
 * @param {number} userid Идентификатор пользователя — владельца списка
 * @returns {Hideable<InlineKeyboardButton.CallbackButton>[]} Кнопка привязки группы
 */
const formBindGroupButton = (ctx, item, userid) => (
  item.state === ListItemState.COOPERATIVE && !item.groupLink && isChatGroup(ctx) ?
    [ Markup.button.callback('Привязать эту группу', `bind_group ${item.id} ${userid}`) ] :
    []
);

/**
 * Формирование встроенной клавиатуры для сообщения с элементом списка желаний
 * В групповом чате отображаются всегда все опции, иначе опции выбираются исходя из состояния
 * подарка и участия пользователя, запрашивающего список, в подарке
 * @function formReplyMarkup
 * @param {Context} ctx Контекст
 * @param {ListItem} item Элемент списка желаний
 * @param {number} userid Идентификатор пользователя — владельца списка
 * @returns {Markup<InlineKeyboardMarkup>[]} Встроенная клавиатура
 */
const formReplyMarkup = (ctx, item, userid) => {
  const bookButton = formBookButton(ctx, item, userid);
  const cooperateButton = formCooperateButton(ctx, item, userid);
  const retireButton = formRetireButton(ctx, item, userid);
  const createGroupButton = formCreateGroupButton(ctx, item, userid);
  const bindGroupButton = formBindGroupButton(ctx, item, userid);

  return [
    bookButton,
    cooperateButton,
    retireButton,
    createGroupButton,
    bindGroupButton,
  ].some(({ length }) => length > 0) ?
    [
      Markup.inlineKeyboard([
        ...(createGroupButton.length > 0 ? [ createGroupButton ] : []),
        ...(bindGroupButton.length > 0 ? [ bindGroupButton ] : []),
        ...(
          bookButton.length > 0 || cooperateButton.length > 0 ?
            [[ ...bookButton, ...cooperateButton ]] :
            []
        ),
        ...(retireButton.length > 0 ? [ retireButton ] : []),
      ]),
    ] :
    [];
};

/**
 * Получение списка желаний пользователя из БД и формирование сообщений
 * для просмотра списка другими пользователями
 * @function formMessages
 * @param {EventBus} eventBus Шина событий
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя — владельца списка
 * @returns {Message[]} Сформированные сообщения
 */
const formMessages = (eventBus, ctx, userid) => eventBus
  .emit(Events.Wishlist.GetList, userid)
  .map((item) => ({
    itemId: item.id,
    message: [
      Format.join(
        [
          Format.join(
            [
              new Format.FmtString(
                item.name,
                [{ offset: 0, length: item.name.length, type: 'bold' }],
              ),
              ...(
                item.description ?
                  [ new Format.FmtString(item.description, item.descriptionEntities) ] :
                  []
              ),
            ],
            '\n',
          ),
          ...(item.category ? [ `🔡 ${item.category}` ] : []),
          formParticipantsBlock(item),
          ...(item.addedById ? [ formAddedByBlock(item) ] : []),
        ],
        '\n\n',
      ),
      ...formReplyMarkup(ctx, item, userid),
    ],
  }));

export default formMessages;
