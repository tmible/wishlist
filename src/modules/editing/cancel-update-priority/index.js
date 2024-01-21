import cancelActionHandler from 'wishlist-bot/helpers/cancel-action-handler';

const configure = (bot) => {
  bot.action('cancel_update_priority', (ctx) => cancelActionHandler(ctx));
};

export default { configure };
