import { Markup } from 'telegraf';
import { sendMessageAndMarkItForMarkupRemove } from 'wishlist-bot/helpers/remove-markup';
import tryEditing from 'wishlist-bot/helpers/try-editing';
import tryPinning from 'wishlist-bot/helpers/try-pinning';

const editMessages = async (ctx, shouldSendNotification, messagesToEditIds, messages, username) => {
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
              username === ctx.chat.username ? 'own_' : ''
            }list${
              username === ctx.chat.username ? '' : ` ${username}`
            }`,
          ),
        ]),
        reply_to_message_id: ctx.session.lists[username].pinnedMessageId,
      },
    );
  }
};

const editOutdatedMessages = (ctx, messagesToEditIds, messages, username, titleMessageText) => {
  return Promise.all([
    ...(ctx.session.lists[username]?.pinnedMessageId ?
      [
        ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.session.lists[username].pinnedMessageId,
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

const pinMessage = async (ctx, username, titleMessageText) => {
  if (!!ctx.session.lists[username]?.pinnedMessageId) {
    await tryPinning(ctx, 'unpinChatMessage', ctx.session.lists[username].pinnedMessageId);
  }

  const messageToPin = await ctx.reply(titleMessageText);

  await tryPinning(ctx, 'pinChatMessage', messageToPin.message_id);

  return messageToPin;
};

const manageListsMessages = async (
  ctx,
  username,
  messages,
  titleMessageText,
  shouldForceNewMessages = false,
  shouldSendNotification = true,
) => {
  const messagesToEditIds = ctx.session.lists[username]?.messagesToEditIds;
  if (
    !shouldForceNewMessages &&
    !messages.some((message) =>
      !messagesToEditIds?.find(({ listItemId }) => listItemId === message.listItemId)
    )
  ) {
    await tryPinning(ctx, 'pinChatMessage', ctx.session.lists[username].pinnedMessageId);
    await editMessages(ctx, shouldSendNotification, messagesToEditIds, messages, username);
    return;
  }

  await editOutdatedMessages(ctx, messagesToEditIds, messages, username, titleMessageText);

  const pinnedMessage = await pinMessage(ctx, username, titleMessageText);

  ctx.session.lists[username] = {
    pinnedMessageId: pinnedMessage.message_id,
    messagesToEditIds: [],
  };

  for (const { listItemId, message } of messages) {
    const sentMessage = await ctx.reply(...message);
    ctx.session.lists[username].messagesToEditIds.push({
      listItemId,
      messageId: sentMessage.message_id,
    });
  }
};

export default manageListsMessages;
