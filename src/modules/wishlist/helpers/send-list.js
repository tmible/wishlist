import { Format } from 'telegraf';
import formMessages from '@tmible/wishlist-bot/helpers/messaging/form-foreign-list-messages';
import getMentionFromUseridOrUsername from '@tmible/wishlist-bot/helpers/messaging/get-mention-from-userid-or-username';
import manageListsMessages from '@tmible/wishlist-bot/helpers/messaging/manage-lists-messages';

/**
 * Значения параметров отправки списка по умолчанию
 * @constant {SendListOptions}
 */
const defaultOptions = {
  shouldForceNewMessages: false,
  shouldSendNotification: false,
  isManualUpdate: false,
};

/**
 * [Отправка (или обновление уже отправленных сообщений)]{@link manageListsMessages} списка желаний пользователя,
 * при его наличии, другим пользователям. При отсутствии желаний пользователя отправляется сообщение об этом
 * @async
 * @function sendList
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {string} [username] Имя пользователя -- владельца списка
 * @param {SendListOptions} [passedOptions={}] Параметры отправки списка (см. аргумент passedOptions {@link manageListsMessages})
 */
const sendList = async (ctx, userid, username, passedOptions = {}) => {
  const messages = formMessages(ctx, userid);

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
