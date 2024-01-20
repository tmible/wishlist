import { Markup } from 'telegraf';
import { sendMessageAndMarkItForMarkupRemove } from 'wishlist-bot/helpers/remove-markup';
import tryEditing from 'wishlist-bot/helpers/try-editing';
import tryPinning from 'wishlist-bot/helpers/try-pinning';

const editMessages = async (ctx, shouldSendNotification, messagesToEditIds, messages, userid) => {
  await Promise.all(messagesToEditIds.map((messageToEditId, i) => {
    if (i >= messages.length) {
      return ctx.deleteMessage(messageToEditId);
    }

    const message = messages[i];

    return tryEditing(
      ctx.telegram,
      'editMessageText',
      ctx.chat.id,
      messageToEditId,
      undefined,
      ...message,
    );
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

const editOutdatedMessages = (
  ctx,
  messagesToEditIds,
  messages,
  userid,
  outdatedTitleMessageText,
) => {
  return Promise.all([
    ...(ctx.session.lists[userid]?.pinnedMessageId ?
      [
        ctx.telegram.editMessageText(
          ctx.chat.id,
          ctx.session.lists[userid].pinnedMessageId,
          undefined,
          outdatedTitleMessageText,
        ),
      ] :
      []
    ),
    (messagesToEditIds ?? []).map((messagesToEditId) =>
      ctx.telegram.editMessageReplyMarkup(ctx.chat.id, messagesToEditId)
    ),
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
  outdatedTitleMessageText,
  shouldForceNewMessages = false,
  shouldSendNotification = true,
) => {
  const messagesToEditIds = ctx.session.lists[userid]?.messagesToEditIds;
  if (
    !shouldForceNewMessages &&
    (messagesToEditIds?.length ?? -1) >= messages.length
  ) {
    await tryPinning(ctx, 'pinChatMessage', ctx.session.lists[userid].pinnedMessageId);
    await editMessages(ctx, shouldSendNotification, messagesToEditIds, messages, userid);
    ctx.session.lists[userid].messagesToEditIds = messagesToEditIds.slice(0, messages.length);
    return;
  }

  await editOutdatedMessages(ctx, messagesToEditIds, messages, userid, outdatedTitleMessageText);

  const pinnedMessage = await pinMessage(ctx, userid, titleMessageText);

  ctx.session.lists[userid] = {
    pinnedMessageId: pinnedMessage.message_id,
    messagesToEditIds: [],
  };

  for (const message of messages) {
    const sentMessage = await ctx.reply(...message);
    ctx.session.lists[userid].messagesToEditIds.push(sentMessage.message_id);
  }
};

export default manageListsMessages;
