import EditMessageErrorMessage from 'wishlist-bot/constants/edit-message-error-message';

const tryEditing = async (ctx, editing, ...editingArgs) => {
  try {
    await ctx[editing](...editingArgs);
  } catch(e) {
    if (!e.message.startsWith(EditMessageErrorMessage)) {
      throw e;
    }
  }
};

export default tryEditing;
