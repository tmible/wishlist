import { strict as assert } from 'node:assert';
import { Markup } from 'telegraf';
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
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {Message[]} messages Новые сообщения со списком
 * @param {boolean} shouldSendNotification Признак необходимости отправки сообщения-уведомления об обновлении
 */
const editMessages = async (ctx, userid, messages, shouldSendNotification) => {
  await Promise.all(
    ctx.session.persistent.lists[userid].messagesToEdit.map((messageToEdit, i) => {
      if (i >= messages.length) {
        return ctx.deleteMessage(messageToEdit.id);
      }

      const message = messages[i];

      let areEntitiesEqual = true;
      let areReplyMarkupsEqual = true;

      try {
        assert.deepEqual(
          messageToEdit.entities.filter(({ type }) => type !== 'url'),
          message[0].entities.filter(({ type }) => type !== 'url'),
        );
      } catch {
        areEntitiesEqual = false;
      }

      try {
        assert.deepEqual(
          messageToEdit.reply_markup.inline_keyboard.map((row) =>
            row.map((button) => ({ text: button.text, callback_data: button.callback_data }))
          ),
          message[1].reply_markup.inline_keyboard.map((row) =>
            row.map((button) => ({ text: button.text, callback_data: button.callback_data }))
          ),
        );
      } catch {
        areReplyMarkupsEqual = false;
      }

      if (messageToEdit.text === message[0].text && areEntitiesEqual && areReplyMarkupsEqual) {
        return Promise.resolve();
      }

      ctx.session.persistent.lists[userid].messagesToEdit[i] = {
        ...messageToEdit,
        text: message[0].text,
        entities: message[0].entities,
        reply_markup: message[1].reply_markup,
      };
      return ctx.telegram.editMessageText(ctx.chat.id, messageToEdit.id, undefined, ...message);
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
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {Message[]} messages Новые сообщения со списком
 * @param {boolean} shouldSendNotification Признак необходимости отправки сообщения-уведомления об обновлении
 */
const updateListsMessages = async (ctx, userid, messages, shouldSendNotification) => {
  await tryPinning(ctx, 'pinChatMessage', ctx.session.persistent.lists[userid].pinnedMessageId);
  await editMessages(ctx, userid, messages, shouldSendNotification);
  ctx.session.persistent.lists[userid].messagesToEdit.length = messages.length;
};

export default updateListsMessages;
