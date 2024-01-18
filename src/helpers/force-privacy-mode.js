const forcePrivacyModeMiddleware = (ctx, next) => {
  if (
    ctx.updateType === 'message' &&
    !ctx.message.entities?.find(({ type }) => type === 'bot_command') &&
    ctx.message.reply_to_message?.from.id !== ctx.botInfo.id
  ) {
    return;
  }

  return next();
};

export default forcePrivacyModeMiddleware;
