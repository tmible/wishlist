import { Format, Markup } from 'telegraf';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import manageListsMessages from '@tmible/wishlist-bot/helpers/messaging/manage-lists-messages';
import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import digitToEmoji from '@tmible/wishlist-bot/utils/digit-to-emoji';

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
 * @async
 * @function sendList
 * @param {Context} ctx Контекст
 * @param {SendListOptions} [passedOptions={}] Параметры отправки списка (см. аргумент passedOptions {@link manageListsMessages})
 */
const sendList = async (ctx, passedOptions = {}) => {
  if (isChatGroup(ctx)) {
    return;
  }

  const userid = ctx.chat.id;

  const messages = emit(Events.Editing.GetList, userid).map((item) => {
    const idLine = `id: ${item.id}`;
    const priorityBlock = digitToEmoji(item.priority);
    const priorityAndNameLine = `${priorityBlock} ${item.name}`;
    const nameOffset = `${idLine}\n${priorityBlock} `.length;
    const descriptionOffset = `${idLine}\n${priorityAndNameLine}\n`.length;

    return {
      itemId: item.id,
      message: [
        new Format.FmtString(
          `${idLine}\n${priorityAndNameLine}${item.description ? `\n${item.description}` : ''}`,
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
