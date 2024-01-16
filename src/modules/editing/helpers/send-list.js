import { Format, Markup } from 'telegraf';
import isChatGroup from 'wishlist-bot/helpers/is-chat-group';
import manageListsMessages from 'wishlist-bot/helpers/manage-lists-messages';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import digitToEmoji from 'wishlist-bot/utils/digit-to-emoji';

const sendList = async (ctx, shouldForceNewMessages = false, shouldSendNotification = true) => {
  if (isChatGroup(ctx)) {
    return;
  }

  const username = ctx.chat.username;

  const messages = (await emit(Events.Editing.GetList, username)).map((item) => {
    const idLine = `id: ${item.id}`;
    const priorityBlock = digitToEmoji(item.priority);
    const priorityAndNameLine = `${priorityBlock} ${item.name}`;
    const nameOffset = `${idLine}\n${priorityBlock} `.length;
    const descriptionOffset = `${idLine}\n${priorityAndNameLine}\n`.length;

    return {
      listItemId: item.id,
      message: [
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
      ],
    };
  });

  if (messages.length === 0) {
    return ctx.reply('Ваш список пуст. Вы можете добавить в него что-нибудь с помощью команды /add');
  }

  await manageListsMessages(
    ctx,
    username,
    messages,
    'Ваш актуальный список',
    shouldForceNewMessages,
    shouldSendNotification,
  );
};

export default sendList;
