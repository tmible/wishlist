import { Markup } from 'telegraf';
import { sendMessageAndMarkItForMarkupRemove } from 'wishlist-bot/helpers/remove-markup';
import tryEditing from 'wishlist-bot/helpers/try-editing';
import tryPinning from 'wishlist-bot/helpers/try-pinning';

const editMessages = async (ctx, shouldSendNotification, messagesToEditIds, messages, userid) => {
  await Promise.all(messagesToEditIds.map((messageToEditId) => {
    const message = messages.find(({ listItemId }) =>
      listItemId === messageToEditId.listItemId
    )?.message;

    return !!message ?
      tryEditing(
        ctx.telegram,
        'editMessageText',
        ctx.chat.id,
        messageToEditId.messageId,
        undefined,
        message[0],
        { ...message[1], parse_mode: 'MarkdownV2' },
      ) :
      ctx.deleteMessage(messageToEditId.messageId);
  }));

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
        reply_to_message_id: ctx.session.lists[userid].pinnedMessageId,
      },
    );
  }
};

const editOutdatedMessages = (ctx, messagesToEditIds, messages, userid, titleMessageText) => {
  return Promise.all([
    ...(ctx.session.lists[userid]?.pinnedMessageId ?
      [
        ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.session.lists[userid].pinnedMessageId,
          undefined,
          titleMessageText.replace(
            /(А|а)ктуальный/,
            (match, p1) => `${p1 === 'А' ? 'Н' : 'н'}еактуальный`,
          ),
        ),
      ] :
      []
    ),
    (messagesToEditIds ?? [])
    .filter(({ listItemId }) => !!messages.find((message) => message.listItemId === listItemId))
    .map(({ messageId }) => ctx.telegram.editMessageReplyMarkup(ctx.chat.id, messageId)),
  ]);
};

const pinMessage = async (ctx, userid, titleMessageText) => {
  if (!!ctx.session.lists[userid]?.pinnedMessageId) {
    await tryPinning(ctx, 'unpinChatMessage', ctx.session.lists[userid].pinnedMessageId);
  }

  const messageToPin = await ctx.reply(titleMessageText);

  await tryPinning(ctx, 'pinChatMessage', messageToPin.message_id);

  return messageToPin;
};

const manageListsMessages = async (
  ctx,
  userid,
  messages,
  titleMessageText,
  shouldForceNewMessages = false,
  shouldSendNotification = true,
) => {
  const messagesToEditIds = ctx.session.lists[userid]?.messagesToEditIds;
  if (
    !shouldForceNewMessages &&
    !messages.some((message) =>
      !messagesToEditIds?.find(({ listItemId }) => listItemId === message.listItemId)
    )
  ) {
    await tryPinning(ctx, 'pinChatMessage', ctx.session.lists[userid].pinnedMessageId);
    await editMessages(ctx, shouldSendNotification, messagesToEditIds, messages, userid);
    return;
  }

  await editOutdatedMessages(ctx, messagesToEditIds, messages, userid, titleMessageText);

  const pinnedMessage = await pinMessage(ctx, userid, titleMessageText);

  ctx.session.lists[userid] = {
    pinnedMessageId: pinnedMessage.message_id,
    messagesToEditIds: [],
  };

  for (const { listItemId, message } of messages) {
    const sentMessage = await ctx.reply(...message);
    ctx.session.lists[userid].messagesToEditIds.push({
      listItemId,
      messageId: sentMessage.message_id,
    });
  }
};

export default manageListsMessages;
