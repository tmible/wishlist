import { Markup } from 'telegraf';
import { sendMessageAndMarkItForMarkupRemove } from 'wishlist-bot/helpers/remove-markup';

const editMessages = async (ctx, shouldSendNotification, messagesToEditIds, messages, chatId) => {
  for (let i = 0; i < messagesToEditIds.length; ++i) {
    const messageToEditId = messagesToEditIds[i];
    const message = messages.find(({ listItemId }) =>
      listItemId === messageToEditId.listItemId
    )?.message;

    if (!message) {
      await ctx.deleteMessage(messageToEditId.messageId);
      continue;
    }

    try {
      await ctx.telegram.editMessageText(
        chatId,
        messageToEditId.messageId,
        undefined,
        message[0],
        { ...message[1], parse_mode: 'MarkdownV2' },
      );
    } catch(e) {
      if (!e.message.startsWith('400: Bad Request: message is not modified')) {
        throw e;
      }
    }
  }

  if (shouldSendNotification) {
    const chatUsername =
      ctx.update.message?.chat.username || ctx.update.callback_query.message.chat.username;

    await sendMessageAndMarkItForMarkupRemove(
      ctx,
      'reply',
      'Список обновлён',
      {
        ...Markup.inlineKeyboard([
          Markup.button.callback(
            'Отправить новые сообщения',
            `force_${
              username === chatUsername ? 'own_' : ''
            }list${
              username === chatUsername ? '' : ` ${username}`
            }`,
          ),
        ]),
        reply_to_message_id: ctx.session.lists[username].pinnedMessageId,
      },
    );
  }
};

const manageListsMessages = async (
  ctx,
  username,
  messages,
  titleMessageText,
  shouldForceNewMessages = false,
  shouldSendNotification = true,
) => {
  const chatId = ctx.update.message?.chat.id || ctx.update.callback_query.message.chat.id;

  const messagesToEditIds = ctx.session.lists[username]?.messagesToEditIds;
  if (
    !shouldForceNewMessages &&
    !messages.some((message) =>
      !messagesToEditIds?.find(({ listItemId }) => listItemId === message.listItemId)
    )
  ) {
    await editMessages(ctx, shouldSendNotification, messagesToEditIds, messages, chatId);
    return;
  }

  for (const { listItemId, messageId } of ctx.session.lists[username]?.messagesToEditIds ?? []) {
    await ctx.telegram.editMessageReplyMarkup(chatId, messageId);
  }

  if (!!ctx.session.lists[username]?.pinnedMessageId) {
    await ctx.unpinChatMessage(ctx.session.lists[username].pinnedMessageId);
  }
  const messageToPin = await ctx.reply(titleMessageText);
  await ctx.pinChatMessage(messageToPin.message_id);

  ctx.session.lists[username] = {
    pinnedMessageId: messageToPin.message_id,
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
