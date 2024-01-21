import cancelActionHandler from 'wishlist-bot/helpers/cancel-action-handler';

const configure = (bot) => {
  bot.action('cancel_add', (ctx) => cancelActionHandler(ctx, 'Добавление отменено', false));
};

export default { configure };
