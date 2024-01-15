import { subscribe } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

const configure = (bot) => {
  bot.command('edit', (ctx) => sendList(ctx, false));
  bot.action('force_own_list', (ctx) => sendList(ctx, true));
  subscribe(Events.Wishlist.HandleOwnList, sendList);
};

export default { configure };
