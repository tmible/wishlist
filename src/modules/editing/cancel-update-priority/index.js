import cancelUpdate from '../helpers/template-functions/cancel-update.js';

const configure = (bot) => {
  bot.action('cancel_update_priority', async (ctx) => {
    await cancelUpdate(
      ctx,
      'updatePriorityId',
      'Обновление приоритета отменено',
    );
  });
};

export default { configure };
