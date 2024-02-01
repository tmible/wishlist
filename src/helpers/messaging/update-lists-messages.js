import { Markup } from 'telegraf';
import tryEditing from '@tmible/wishlist-bot/helpers/messaging/try-editing';
import tryPinning from '@tmible/wishlist-bot/helpers/messaging/try-pinning';
import {
  sendMessageAndMarkItForMarkupRemove,
} from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';

/**
 * Обновление содержания сообщений с опциональной отправкой сообщения об этом
 * Если сообщений больше, чем нужно, лишние будут удалены
 * @async
 * @function editMessages
 * @param {Context} ctx Контекст
 * @param {boolean} shouldSendNotification Признак необходимости отправки сообщения об обновлении
 * @param {Message[]} messages Новые сообщения со списком
 * @param {string} userid Идентификатор пользователя -- владельца списка
 */
const editMessages = async (ctx, shouldSendNotification, messages, userid) => {
  await Promise.all(
    ctx.session.persistent.lists[userid].messagesToEditIds.map((messageToEditId, i) => {
      if (i >= messages.length) {
        return ctx.deleteMessage(messageToEditId);
      }

      const message = messages[i];

      return tryEditing(
        ctx,
        ctx.chat.id,
        messageToEditId,
        undefined,
        ...message,
      );
    }),
  );

  if (shouldSendNotification) {
    await sendMessageAndMarkItForMarkupRemove(
      ctx,
      'reply',
      'Список обновлён',
      {
        ...Markup.inlineKeyboard([
          Markup.button.callback(
            'Отправить новые сообщения',
            `force_${
              userid === ctx.chat.id ? 'own_' : ''
            }list${
              userid === ctx.chat.id ? '' : ` ${userid}`
            }`,
          ),
        ]),
        reply_to_message_id: ctx.session.persistent.lists[userid].pinnedMessageId,
      },
    );
  }
};

/**
 * Обновление списка. Перезакрепление заглавного сообщения,
 * [обновление отправленных ранее сообщений]{@link editMessages}.
 * @async
 * @function updateListsMessages
 * @param {Context} ctx Контекст
 * @param {string} userid Идентификатор пользователя -- владельца списка
 * @param {Message[]} messages Новые сообщения со списком
 * @param {boolean} [shouldSendNotification=true] Признак необходимости отправки сообщения-уведомления об обновлении
 */
const updateListsMessages = async (ctx, userid, messages, shouldSendNotification = true) => {
  await tryPinning(ctx, 'pinChatMessage', ctx.session.persistent.lists[userid].pinnedMessageId);
  await editMessages(ctx, shouldSendNotification, messages, userid);
  ctx.session.persistent.lists[userid].messagesToEditIds.length = messages.length;
};

export default updateListsMessages;
