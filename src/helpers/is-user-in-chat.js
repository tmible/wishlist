import isChatGroup from 'wishlist-bot/helpers/is-chat-group';

const isUserInChat = async (ctx, userid) => {
  const chatMember = !!userid && isChatGroup(ctx) ? await ctx.getChatMember(userid) : undefined;
  return !!userid &&
    isChatGroup(ctx) &&
    !!chatMember &&
    ![ 'left', 'kicked' ].includes(chatMember.status) &&
    (chatMember.status !== 'restricted' || chatMember.is_member);
};

export default isUserInChat;
