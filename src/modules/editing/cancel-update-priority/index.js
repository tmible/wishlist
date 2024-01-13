import cancelUpdate from '../helpers/template-functions/cancel-update.js';

const configure = (bot) => {
  bot.command('cancel_update_priority', async (ctx) => {
    await cancelUpdate(
      ctx,
      [ 'updatePriority', 'updatePriorityId' ],
      'Обновление приоритета отменено',
    );
  });
};

export default { configure };
