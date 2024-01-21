import cancelActionHandler from 'wishlist-bot/helpers/cancel-action-handler';

const configure = (bot) => {
  bot.action(
    'cancel_clear_list',
    (ctx) => cancelActionHandler(ctx, 'Очищение списка отменено', false),
  );
};

export default { configure };
