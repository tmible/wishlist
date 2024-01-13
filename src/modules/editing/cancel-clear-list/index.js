import cancelUpdate from '../helpers/template-functions/cancel-update.js';

const configure = (bot) => {
  bot.command('cancel_clear_list', async (ctx) => {
    await cancelUpdate(ctx, 'clearList', 'Очищение списка отменено');
  });
};

export default { configure };
