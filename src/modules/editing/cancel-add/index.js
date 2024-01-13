import cancelUpdate from '../helpers/template-functions/cancel-update.js';

const configure = (bot) => {
  bot.action('cancel_add', async (ctx) => {
    await cancelUpdate(ctx, 'addItemToWishlist', 'Добавление отменено');
  });
};

export default { configure };
