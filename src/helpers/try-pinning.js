import PinMessageErrorMessage from 'wishlist-bot/constants/pin-message-error-message';

const tryPinning = async (ctx, pinning, ...pinningArgs) => {
  try {
    await ctx[pinning](...pinningArgs);
  } catch(e) {
    if (!e.message.startsWith(PinMessageErrorMessage)) {
      throw e;
    }
  }
};

export default tryPinning;
