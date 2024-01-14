import cancelUpdate from '../helpers/template-functions/cancel-update.js';

const configure = (bot) => {
  bot.action('cancel_update_description', async (ctx) => {
    await cancelUpdate(ctx, 'updateDescriptionId');
  });
};

export default { configure };
