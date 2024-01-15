import configureModules from 'wishlist-bot/helpers/configure-modules';
import BookModule from 'wishlist-bot/modules/wishlist/book';
import CancelListModule from 'wishlist-bot/modules/wishlist/cancel-list';
import CooperateModule from 'wishlist-bot/modules/wishlist/cooperate';
import ListModule from 'wishlist-bot/modules/wishlist/list';
import RetireModule from 'wishlist-bot/modules/wishlist/retire';

const configure = (bot) => {
  console.log('configuring wishlist module');
  configureModules(bot, [
    ListModule,
    CancelListModule,
    BookModule,
    CooperateModule,
    RetireModule,
  ]);
};

export default { configure };
