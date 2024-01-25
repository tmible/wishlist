import { Format, Markup } from 'telegraf';
import isChatGroup from 'wishlist-bot/helpers/is-chat-group';
import manageListsMessages from 'wishlist-bot/helpers/messaging/manage-lists-messages';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import digitToEmoji from 'wishlist-bot/utils/digit-to-emoji';

/**
 * [Отправка (или обновление уже отправленных сообщений)]{@link manageListsMessages}
 * собственного списка желаний пользователя, при его наличии и при условии, что чат не групповой.
 * При отсутствии желаний пользователя отправляется сообщение об этом
 * @async
 * @function sendList
 * @param {Context} ctx Контекст
 * @param {boolean} [shouldForceNewMessages=false] Признак необходимости отправки новых сообщений (см. аргумент shouldForceNewMessages {@link manageListsMessages})
 * @param {boolean} [shouldSendNotification=true] Признак необходимости отправки сообщения-уведомления об обновлении
 */
const sendList = async (ctx, shouldForceNewMessages = false, shouldSendNotification = true) => {
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

  if (messages.length === 0) {
    return ctx.reply('Ваш список пуст. Вы можете добавить в него что-нибудь с помощью команды /add');
  }

  await manageListsMessages(
    ctx,
    userid,
    messages,
    'Ваш актуальный список',
    'Ваш неактуальный список',
    shouldForceNewMessages,
    shouldSendNotification,
  );
};

export default sendList;
