import { Format, Markup } from 'telegraf';
import ListItemState from '@tmible/wishlist-bot/constants/list-item-state';
import ListItemStateToEmojiMap from '../constants/list-item-state-to-emoji-map.const.js';
import getMentionFromUseridOrUsername from '@tmible/wishlist-bot/helpers/messaging/get-mention-from-userid-or-username';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import manageListsMessages from '@tmible/wishlist-bot/helpers/messaging/manage-lists-messages';
import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import digitToEmoji from '@tmible/wishlist-bot/utils/digit-to-emoji';

/**
 * Формирование блока с упоминаниями забронировавего подарок пользователя
 * или участников кооперации по подарку
 * @function formParticipantsBlock
 * @param {ListItem} item Элемент списка желаний
 * @returns {FmtString} Блок с упоминаниями
 */
const formParticipantsBlock = (item) => {
  const participantsMentions = item.participants.map((username, i) =>
    getMentionFromUseridOrUsername(item.participantsIds[i], username)
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
 * @param {string} userid Идентификатор пользователя -- владельца списка
 * @returns {Markup<InlineKeyboardMarkup>} Встроенная клавиатура
 */
const formReplyMarkup = (ctx, item, userid) => {
  const bookButton = isChatGroup(ctx) || item.state === ListItemState.FREE ?
    [ Markup.button.callback('Забронировать', `book ${item.id} ${userid}`) ] :
    [];

  const cooperateButton =
    isChatGroup(ctx) ||
    item.state === ListItemState.FREE ||
    (
      item.state === ListItemState.COOPERATIVE &&
      !item.participantsIds.includes(ctx.from.id.toString())
    ) ?
      [ Markup.button.callback('Поучаствовать', `cooperate ${item.id} ${userid}`) ] :
      [];

  const retireButton =
    isChatGroup(ctx) ||
    (
      item.state !== ListItemState.FREE &&
      item.participantsIds.includes(ctx.from.id.toString())
    ) ?
      [ Markup.button.callback('Отказаться', `retire ${item.id} ${userid}`) ] :
      [];

  return Markup.inlineKeyboard([
    ...(bookButton.length > 0 || cooperateButton.length > 0 ?
      [[ ...bookButton, ...cooperateButton ]] :
      []
    ),
    ...(retireButton.length > 0 ? [[ ...retireButton ]] : []),
  ]);
};

/**
* Значения параметры отправки списка по умолчанию
* @constant {SendListOptions}
*/
const defaultOptions = {
  shouldForceNewMessages: false,
  shouldSendNotification: false,
};

/**
 * [Отправка (или обновление уже отправленных сообщений)]{@link manageListsMessages} списка желаний пользователя,
 * при его наличии, другим пользователям. При отсутствии желаний пользователя отправляется сообщение об этом
 * @async
 * @function sendList
 * @param {Context} ctx Контекст
 * @param {string} userid Идентификатор пользователя -- владельца списка
 * @param {string} [username] Имя пользователя -- владельца списка
 * @param {SendListOptions} [passedOptions={}] Параметры отправки списка (см. аргумент passedOptions {@link manageListsMessages})
 */
const sendList = async (ctx, userid, username, passedOptions = {}) => {
  const messages = emit(Events.Wishlist.GetList, userid).map((item) => {
    const stateBlock = ListItemStateToEmojiMap.get(item.state);
    const priorityBlock = digitToEmoji(item.priority);
    const emojisBlock = `${stateBlock} ${priorityBlock} `;
    const participantsBlock = formParticipantsBlock(item);

    return [
      Format.join([
        new Format.FmtString(
          `${emojisBlock}${item.name}\n`,
          [{ offset: emojisBlock.length, length: item.name.length, type: 'bold' }],
        ),
        new Format.FmtString(item.description, item.descriptionEntities),
        participantsBlock,
      ]),

      formReplyMarkup(ctx, item, userid),
    ];
  });

  const userMention = getMentionFromUseridOrUsername(userid, username);

  if (messages.length === 0) {
    return ctx.sendMessage(Format.join([ 'Список', userMention, 'пуст' ], ' '));
  }

  await manageListsMessages(
    ctx,
    userid,
    messages,
    Format.join([ 'Актуальный список', userMention ], ' '),
    Format.join([ 'Неактуальный список', userMention ], ' '),
    {
      ...defaultOptions,
      ...passedOptions,
    },
  );
};

export default sendList;
