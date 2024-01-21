import cancelActionHandler from 'wishlist-bot/helpers/cancel-action-handler';

const configure = (bot) => {
  bot.action('cancel_update_description', (ctx) => cancelActionHandler(ctx));
};

export default { configure };
