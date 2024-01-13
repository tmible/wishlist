import cancelUpdate from '../helpers/template-functions/cancel-update.js';

const configure = (bot) => {
  bot.command('cancel_update_name', async (ctx) => {
    await cancelUpdate(ctx, [ 'updateName', 'updateNameId' ], 'Обновление названия отменено');
  });
};

export default { configure };
