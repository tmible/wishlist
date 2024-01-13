import { Format, Markup } from 'telegraf';
import ListItemState from 'wishlist-bot/constants/list-item-state';
import ListItemStateToEmojiMap from 'wishlist-bot/constants/list-item-state-to-emoji-map';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import digitToEmoji from 'wishlist-bot/utils/digit-to-emoji';

const sendList = async (ctx, updatePropertyKey) => {
  const messages = (await emit(Events.Wishlist.GetList)).map((item) => {
    const stateBlock = ListItemStateToEmojiMap.get(item.state);
    const priorityBlock = digitToEmoji(item.priority);
    const nameOffset = `${stateBlock} ${priorityBlock} `.length;
    const descriptionOffset = `${stateBlock} ${priorityBlock} ${item.name}\n`.length;
    const participantsBlock =
      item.participants.length > 0 ?
        item.state === ListItemState.BOOKED ?
          `\n\nзабронировал @${item.participants[0]}` :
          `\n\nучастники: @${item.participants.join(', @')}` :
        '';

    return [
      new Format.FmtString(
        `${stateBlock} ${priorityBlock} ${item.name}\n${item.description}${participantsBlock}`,
        [
          ...item.descriptionEntities.map((entity) => ({
            ...entity,
            offset: entity.offset + descriptionOffset,
          })),
          { offset: nameOffset, length: item.name.length, type: 'bold' },
        ],
      ),

      Markup.inlineKeyboard([
        ...(
          item.state === ListItemState.FREE ?
            [ Markup.button.callback('Забронировать', `book ${item.id}`) ] :
            []
        ),
        ...(
          item.state === ListItemState.FREE ||
          (
            item.state === ListItemState.COOPERATIVE &&
            !item.participants.includes(ctx.update[updatePropertyKey].from.username)
          ) ?
            [ Markup.button.callback('Поучаствовать', `cooperate ${item.id}`) ] :
            []
        ),
        ...(
          (
            item.state === ListItemState.COOPERATIVE ||
            item.state === ListItemState.BOOKED
          ) && item.participants.includes(ctx.update[updatePropertyKey].from.username) ?
            [ Markup.button.callback('Отказаться', `retire ${item.id}`) ] :
            []
        ),
      ]),
    ];
  });

  await ctx.sendMessage('Актуальный список:');
  for (const message of messages) {
    await ctx.reply(...message);
  }
};

export default sendList;
