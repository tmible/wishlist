import ListItemState from '@tmible/wishlist-common/constants/list-item-state';
import { emit } from '@tmible/wishlist-common/event-bus';
import { Markup } from 'telegraf';
import Events from '@tmible/wishlist-bot/architecture/events';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';
import { sendMessageAndMarkItForMarkupRemove } from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';

/** @typedef {import('telegraf').Context} Context */

/**
 * Привязка группы для кооперации к подарку
 * @function bindGroup
 * @param {Context} ctx Конеткст
 * @param {number} wishlistItemId Идентификатор подарка
 * @returns {Promise<void>}
 * @async
 */
const bindGroup = async (ctx, wishlistItemId) => {
  if (
    !isChatGroup(ctx) ||
    emit(Events.Wishlist.GetWishlistItemState, wishlistItemId) !== ListItemState.COOPERATIVE ||
    emit(Events.Wishlist.GetWishlistItemGroupLink, wishlistItemId) ||
    !emit(Events.Wishlist.GetWishlistItemParticipants).includes(ctx.from.id)
  ) {
    return;
  }

  const { invite_link: inviteLink } = await ctx.getChat();

  if (!inviteLink) {
    ctx.session.messagePurpose = {
      type: MessagePurposeType.InviteLink,
      payload: { wishlistItemId, userid: Number.parseInt(ctx.match[2]) },
    };
    await sendMessageAndMarkItForMarkupRemove(
      ctx,
      'reply',
      'Не вижу пригласительной ссылки. Либо назначьте меня администратором, либо отправьте мне ' +
      'ссылку, которую хотите использовать, ответом на это сообщение',
      Markup.inlineKeyboard([
        Markup.button.callback('Не привязывать группу', 'cancel_bind_group'),
      ]),
    );
    return;
  }

  emit(Events.Wishlist.SetWishlistItemGroupLink, wishlistItemId, inviteLink);

  ctx.session.messagePurpose = {
    type: MessagePurposeType.InviteLink,
    payload: { wishlistItemId, userid: Number.parseInt(ctx.match[2]) },
  };
  await ctx.reply('Группа привязана с моей пригласительной ссылкой!');
  await sendMessageAndMarkItForMarkupRemove(
    ctx,
    'reply',
    'Если хотите использовать другую, отправьте её мне ответом на это сообщение',
    Markup.inlineKeyboard([
      Markup.button.callback('Оставить эту ссылку', 'cancel_bind_group'),
    ]),
  );
};

export default bindGroup;
