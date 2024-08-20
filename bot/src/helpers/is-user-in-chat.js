import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';

/** @typedef {import('telegraf').Context} Context */

/**
 * Проверка наличия пользователя среди участников чата
 * @function isUserInChat
 * @param {Context} ctx Контекст
 * @param {number} [userid] Идентификатор пользователя
 * @returns {boolean} Признак наличия пользователя среди участников чата
 * @async
 */
const isUserInChat = async (ctx, userid) => {
  const chatMember = !!userid && isChatGroup(ctx) ? await ctx.getChatMember(userid) : undefined;
  return !!userid &&
    isChatGroup(ctx) &&
    !!chatMember &&
    ![ 'left', 'kicked' ].includes(chatMember.status) &&
    (chatMember.status !== 'restricted' || chatMember.is_member);
};

export default isUserInChat;
