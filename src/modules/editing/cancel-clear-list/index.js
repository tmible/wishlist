import cancelUpdate from '../helpers/template-functions/cancel-update.js';

const configure = (bot) => {
  bot.action('cancel_clear_list', async (ctx) => {
    await cancelUpdate(ctx, 'clearList', 'Очищение списка отменено', false);
  });
};

export default { configure };
