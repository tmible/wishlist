import { Markup } from 'telegraf';
import tryEditing from 'wishlist-bot/helpers/messaging/try-editing';
import tryPinning from 'wishlist-bot/helpers/messaging/try-pinning';
import {
  sendMessageAndMarkItForMarkupRemove,
} from 'wishlist-bot/helpers/middlewares/remove-markup';

const editMessages = async (ctx, shouldSendNotification, messages, userid) => {
  await Promise.all(
    ctx.session.persistent.lists[userid].messagesToEditIds.map((messageToEditId, i) => {
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

const editOutdatedMessages = (ctx, messages, userid, outdatedTitleMessageText) => {
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
    (ctx.session.persistent.lists[userid]?.messagesToEditIds ?? []).map((messagesToEditId) =>
      ctx.telegram.editMessageReplyMarkup(ctx.chat.id, messagesToEditId)
    ),
  ]);
};

const pinMessage = async (ctx, userid, titleMessageText) => {
  if (!!ctx.session.persistent.lists[userid]?.pinnedMessageId) {
    await tryPinning(ctx, 'unpinChatMessage', ctx.session.persistent.lists[userid].pinnedMessageId);
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
  if (
    !shouldForceNewMessages &&
    (ctx.session.persistent.lists[userid]?.messagesToEditIds?.length ?? -1) >= messages.length
  ) {
    await tryPinning(ctx, 'pinChatMessage', ctx.session.persistent.lists[userid].pinnedMessageId);
    await editMessages(ctx, shouldSendNotification, messages, userid);
    ctx.session.persistent.lists[userid].messagesToEditIds.length = messages.length;
    return;
  }

  await editOutdatedMessages(ctx, messages, userid, outdatedTitleMessageText);

  const pinnedMessage = await pinMessage(ctx, userid, titleMessageText);

  ctx.session.persistent.lists[userid] = {
    pinnedMessageId: pinnedMessage.message_id,
    messagesToEditIds: [],
  };

  for (const message of messages) {
    const sentMessage = await ctx.reply(...message);
    ctx.session.persistent.lists[userid].messagesToEditIds.push(sentMessage.message_id);
  }
};

export default manageListsMessages;
