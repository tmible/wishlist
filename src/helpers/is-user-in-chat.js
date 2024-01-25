import isChatGroup from 'wishlist-bot/helpers/is-chat-group';

/**
 * Проверка наличия пользователя среди участников чата
 * @async
 * @function isUserInChat
 * @param {Context} ctx Контекст
 * @param {string} [userid] идентификатор пользователя
 * @returns {boolean} признак наличия пользователя среди участников чата
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
