import { Markup } from 'telegraf';
import tryPinning from '@tmible/wishlist-bot/helpers/messaging/try-pinning';

/**
 * Обновление старых сообщений с элементами списка:
 * указание неактуальности и удаление встроенной клавиатуры
 * @async
 * @function editOutdatedMessages
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {FmtString | string} outdatedTitleMessageText Текст заглавного сообщения неактуального списка
 * @param {SendListOptions} options Параметры отправки списка
 */
const editOutdatedMessages = (ctx, userid, outdatedTitleMessageText, options) => {
  return Promise.all([
    ...(ctx.session.persistent.lists[userid]?.pinnedMessageId ?
      [
        ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.session.persistent.lists[userid].pinnedMessageId,
          undefined,
          outdatedTitleMessageText,
          ...(options.isAutoUpdate ?
            [
              Markup.inlineKeyboard([
                Markup.button.callback('🔄 Обновить', `manual_update ${userid}`),
              ]),
            ] :
            []
          ),
        ),
      ] :
      []
    ),
    ...(
      options.isManualUpdate ?
        [] :
        ctx.session.persistent.lists[userid]?.messagesToEdit ?? []
    ).map(({ id }) =>
      ctx.telegram.editMessageReplyMarkup(ctx.chat.id, id)
    ),
  ]);
};

/**
 * Открепление заглавного сообщения неактуального списка (при наличии)
 * и отправка и закрепление нового заглавного сообщения
 * @async
 * @function pinMessage
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {FmtString | string} titleMessageText Текст заглавного сообщения актуального списка
 * @returns {{ message_id: number } & Record<string, unknown>} Новое заглавное сообщение
 */
const pinMessage = async (ctx, userid, titleMessageText) => {
  if (!!ctx.session.persistent.lists[userid]?.pinnedMessageId) {
    await tryPinning(ctx, 'unpinChatMessage', ctx.session.persistent.lists[userid].pinnedMessageId);
  }

  const messageToPin = await ctx.reply(
    titleMessageText,
    Markup.inlineKeyboard([[
      Markup.button.callback(
        '🔄 Обновить',
        `update_${
          userid === ctx.chat.id ? 'own_' : ''
        }list${
          userid === ctx.chat.id ? '' : ` ${userid}`
        }`,
      ),
    ], [
      Markup.button.callback(
        '💬 Отправить новые сообщения',
        `force_${
          userid === ctx.chat.id ? 'own_' : ''
        }list${
          userid === ctx.chat.id ? '' : ` ${userid}`
        }`,
      ),
    ]]),
  );

  await tryPinning(ctx, 'pinChatMessage', messageToPin.message_id);

  return messageToPin;
};

/**
 * Обновление списка. [Обновление отправленных ранее сообщений]{@link editOutdatedMessages},
 * отправка новых сообщений
 * @async
 * @function resendListsMessages
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {Message[]} messages Новые сообщения со списком
 * @param {FmtString | string} titleMessageText Текст заглавного сообщения актуального списка
 * @param {FmtString | string} outdatedTitleMessageText Текст заглавного сообщения неактуального списка
 * @param {SendListOptions} options Параметры отправки списка
 */
const resendListsMessages = async (
  ctx,
  userid,
  messages,
  titleMessageText,
  outdatedTitleMessageText,
  options,
) => {
  await editOutdatedMessages(ctx, userid, outdatedTitleMessageText, options);

  if (options.isAutoUpdate) {
    return;
  }

  const pinnedMessage = await pinMessage(ctx, userid, titleMessageText);

  ctx.session.persistent.lists[userid] = {
    pinnedMessageId: pinnedMessage.message_id,
    messagesToEdit: [],
  };

  for (const { itemId, message } of messages) {
    const sentMessage = await ctx.reply(...message);
    ctx.session.persistent.lists[userid].messagesToEdit.push({
      id: sentMessage.message_id,
      itemId,
      text: sentMessage.text,
      entities: sentMessage.entities,
      reply_markup: sentMessage.reply_markup,
    });
  }
};

export default resendListsMessages;
