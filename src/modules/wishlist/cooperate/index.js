import ListItemState from 'wishlist-bot/constants/list-item-state';
import { emit } from 'wishlist-bot/store/event-bus';
import Events from 'wishlist-bot/store/events';
import sendList from '../helpers/send-list.js';

const configure = (bot) => {
  bot.action(/^cooperate (\d+) ([0-9]+)$/, async (ctx) => {
    const id = ctx.match[1];

    if ((await emit(Events.Wishlist.GetItemState, id)) !== ListItemState.BOOKED) {
      await emit(Events.Wishlist.CooperateOnItem, id, ctx.from.id);
    }

    await sendList(ctx, ctx.match[2]);
  });
};

export default { configure };
