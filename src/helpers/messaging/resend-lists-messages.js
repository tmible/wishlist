import tryPinning from '@tmible/wishlist-bot/helpers/messaging/try-pinning';

/**
 * Обновление старых сообщений с элементами списка:
 * указание неактуальности и удаление встроенной клавиатуры
 * @async
 * @function editOutdatedMessages
 * @param {Context} ctx Контекст
 * @param {string} userid Идентификатор пользователя -- владельца списка
 * @param {FmtString | string} outdatedTitleMessageText Текст заглавного сообщения неактуального списка
 */
const editOutdatedMessages = (ctx, userid, outdatedTitleMessageText) => {
  return Promise.all([
    ...(ctx.session.persistent.lists[userid]?.pinnedMessageId ?
      [
        ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.session.persistent.lists[userid].pinnedMessageId,
          undefined,
          outdatedTitleMessageText,
        ),
      ] :
      []
    ),
    ...(ctx.session.persistent.lists[userid]?.messagesToEdit ?? []).map(({ id }) =>
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
 * @param {string} userid Идентификатор пользователя -- владельца списка
 * @param {FmtString | string} titleMessageText Текст заглавного сообщения актуального списка
 * @returns {{ message_id: unknown } & Record<string, unknown>} Новое заглавное сообщение
 */
const pinMessage = async (ctx, userid, titleMessageText) => {
  if (!!ctx.session.persistent.lists[userid]?.pinnedMessageId) {
    await tryPinning(ctx, 'unpinChatMessage', ctx.session.persistent.lists[userid].pinnedMessageId);
  }

  const messageToPin = await ctx.reply(titleMessageText);

  await tryPinning(ctx, 'pinChatMessage', messageToPin.message_id);

  return messageToPin;
};

/**
 * Обновление списка. [Обновление отправленных ранее сообщений]{@link editOutdatedMessages},
 * отправка новых сообщений
 * @async
 * @function resendListsMessages
 * @param {Context} ctx Контекст
 * @param {string} userid Идентификатор пользователя -- владельца списка
 * @param {Message[]} messages Новые сообщения со списком
 * @param {FmtString | string} titleMessageText Текст заглавного сообщения актуального списка
 * @param {FmtString | string} outdatedTitleMessageText Текст заглавного сообщения неактуального списка
 */
const resendListsMessages = async (
  ctx,
  userid,
  messages,
  titleMessageText,
  outdatedTitleMessageText,
) => {
  await editOutdatedMessages(ctx, userid, outdatedTitleMessageText);

  const pinnedMessage = await pinMessage(ctx, userid, titleMessageText);

  ctx.session.persistent.lists[userid] = {
    pinnedMessageId: pinnedMessage.message_id,
    messagesToEdit: [],
  };

  for (const message of messages) {
    const sentMessage = await ctx.reply(...message);
    ctx.session.persistent.lists[userid].messagesToEdit.push({
      id: sentMessage.message_id,
      text: sentMessage.text,
      entities: sentMessage.entities,
      reply_markup: sentMessage.reply_markup,
    });
  }
};

export default resendListsMessages;
