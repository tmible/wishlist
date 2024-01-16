const isChatGroup = (ctx) => {
  return ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';
};

export default isChatGroup;
