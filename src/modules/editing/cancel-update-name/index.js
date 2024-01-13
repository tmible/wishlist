import cancelUpdate from '../helpers/template-functions/cancel-update.js';

const configure = (bot) => {
  bot.action('cancel_update_name', async (ctx) => {
    await cancelUpdate(ctx, 'updateNameId', 'Обновление названия отменено');
  });
};

export default { configure };
