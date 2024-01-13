import { Format, Markup } from 'telegraf';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import digitToEmoji from 'wishlist-bot/utils/digit-to-emoji';

const sendList = async (ctx) => {
  const messages = (await emit(Events.Editing.GetList)).map((item) => {
    const idLine = `id: ${item.id}`;
    const priorityBlock = digitToEmoji(item.priority);
    const priorityAndNameLine = `${priorityBlock} ${item.name}`;
    const nameOffset = `${idLine}\n${priorityBlock} `.length;
    const descriptionOffset = `${idLine}\n${priorityAndNameLine}\n`.length;

    return [
      new Format.FmtString(
        `${idLine}\n${priorityAndNameLine}\n${item.description}`,
        [
          ...item.descriptionEntities.map((entity) => ({
            ...entity,
            offset: entity.offset + descriptionOffset,
          })),
          { offset: 0, length: idLine.length, type: 'italic' },
          { offset: nameOffset, length: item.name.length, type: 'bold' },
        ],
      ),

      Markup.inlineKeyboard([
        [ Markup.button.callback('Изменить приоритет', `update_priority ${item.id}`) ],
        [ Markup.button.callback('Изменить название', `update_name ${item.id}`) ],
        [ Markup.button.callback('Изменить описание', `update_description ${item.id}`) ],
        [ Markup.button.callback('Удалить', `delete ${item.id}`) ],
      ]),
    ];
  });

  await ctx.sendMessage('Актуальный список:');
  for (const message of messages) {
    await ctx.reply(...message);
  }
};

export default sendList;
