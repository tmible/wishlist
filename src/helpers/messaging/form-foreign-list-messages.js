import { Format, Markup } from 'telegraf';
import Events from '@tmible/wishlist-bot/architecture/events';
import ListItemState from '@tmible/wishlist-bot/constants/list-item-state';
import ListItemStateToEmojiMap from '@tmible/wishlist-bot/constants/list-item-state-to-emoji-map';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import getMentionFromUseridOrUsername from '@tmible/wishlist-bot/helpers/messaging/get-mention-from-userid-or-username';
import digitToEmoji from '@tmible/wishlist-bot/utils/digit-to-emoji';

/**
 * @typedef {import('telegraf').Context} Context
 * @typedef {import('telegraf').InlineKeyboardMarkup} InlineKeyboardMarkup
 * @typedef {import('@tmible/wishlist-bot/architecture/event-bus').EventBus} EventBus
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
  const participantsMentions = item.participants.map(
    (username, i) => getMentionFromUseridOrUsername(item.participantsIds[i], username),
  );

  if (item.participants.length === 0) {
    return new Format.FmtString('');
  }

  return item.state === ListItemState.BOOKED ?
    Format.join([ '\n\nзабронировал', participantsMentions[0] ], ' ') :
    Format.join([ '\n\nучастники:', Format.join(participantsMentions, ', ') ], ' ');
};

/**
 * Формирование встроенной клавиатуры для сообщения с элементом списка желаний
 * В групповом чате отображаются всегда все опции, иначе опции выбираются исходя из состояния
 * подарка и участия пользователя, запрашивающего список, в подарке
 * @function formReplyMarkup
 * @param {Context} ctx Контекст
 * @param {ListItem} item Элемент списка желаний
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @returns {Markup<InlineKeyboardMarkup>[]} Встроенная клавиатура
 */
const formReplyMarkup = (ctx, item, userid) => {
  const bookButton = isChatGroup(ctx) || item.state === ListItemState.FREE ?
    [ Markup.button.callback('🔒 Забронировать', `book ${item.id} ${userid}`) ] :
    [];

  const cooperateButton =
    isChatGroup(ctx) ||
    item.state === ListItemState.FREE ||
    (
      item.state === ListItemState.COOPERATIVE &&
      !item.participantsIds.includes(ctx.from.id)
    ) ?
      [ Markup.button.callback('🤝 Поучаствовать', `cooperate ${item.id} ${userid}`) ] :
      [];

  const retireButton =
    isChatGroup(ctx) ||
    (
      item.state !== ListItemState.FREE &&
      item.participantsIds.includes(ctx.from.id)
    ) ?
      [ Markup.button.callback('🙅 Отказаться', `retire ${item.id} ${userid}`) ] :
      [];

  return [ bookButton, cooperateButton, retireButton ].some(({ length }) => length > 0) ?
    [ Markup.inlineKeyboard([
      ...(bookButton.length > 0 || cooperateButton.length > 0 ?
        [[ ...bookButton, ...cooperateButton ]] :
        []
      ),
      ...(retireButton.length > 0 ? [ retireButton ] : []),
    ]) ] :
    [];
};

/**
 * Получение списка желаний пользователя из БД и формирование сообщений
 * для просмотра списка другими пользователями
 * @function formMessages
 * @param {EventBus} eventBus Шина событий
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @returns {Message[]} Сформированные сообщения
 */
const formMessages = (eventBus, ctx, userid) => eventBus
  .emit(Events.Wishlist.GetList, userid)
  .map((item) => {
    const stateBlock = ListItemStateToEmojiMap.get(item.state);
    const priorityBlock = digitToEmoji(item.priority);
    const emojisBlock = `${stateBlock} ${priorityBlock} `;
    const participantsBlock = formParticipantsBlock(item);

    return {
      itemId: item.id,
      message: [
        Format.join([
          new Format.FmtString(
            `${emojisBlock}${item.name}`,
            [{ offset: emojisBlock.length, length: item.name.length, type: 'bold' }],
          ),
          ...(
            item.description ?
              [ new Format.FmtString(`\n${item.description}`, item.descriptionEntities) ] :
              []
          ),
          participantsBlock,
        ]),

        ...formReplyMarkup(ctx, item, userid),
      ],
    };
  });

export default formMessages;
