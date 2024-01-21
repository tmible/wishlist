import { Format, Markup } from 'telegraf';
import ListItemState from 'wishlist-bot/constants/list-item-state';
import ListItemStateToEmojiMap from 'wishlist-bot/constants/list-item-state-to-emoji-map';
import getMentionFromUseridOrUsername from 'wishlist-bot/helpers/messaging/get-mention-from-userid-or-username';
import isChatGroup from 'wishlist-bot/helpers/is-chat-group';
import manageListsMessages from 'wishlist-bot/helpers/messaging/manage-lists-messages';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import digitToEmoji from 'wishlist-bot/utils/digit-to-emoji';

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

  return Markup.inlineKeyboard([[ ...bookButton, ...cooperateButton ], [ ...retireButton ]]);
};

const sendList = async (
  ctx,
  userid,
  username,
  shouldForceNewMessages = false,
  shouldSendNotification = false,
) => {
  const messages = (await emit(Events.Wishlist.GetList, userid)).map((item) => {
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
    shouldForceNewMessages,
    shouldSendNotification,
  );
};

export default sendList;
