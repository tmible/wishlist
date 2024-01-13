import configureModules from 'wishlist-bot/helpers/configure-modules';
import AddModule from 'wishlist-bot/modules/editing/add';
import CancelAddModule from 'wishlist-bot/modules/editing/cancel-add';
import CancelClearListModule from 'wishlist-bot/modules/editing/cancel-clear-list';
import CancelUpdateDescriptionModule from 'wishlist-bot/modules/editing/cancel-update-description';
import CancelUpdateNameModule from 'wishlist-bot/modules/editing/cancel-update-name';
import CancelUpdatePriorityModule from 'wishlist-bot/modules/editing/cancel-update-priority';
import ClearListModule from 'wishlist-bot/modules/editing/clear-list';
import DeleteModule from 'wishlist-bot/modules/editing/delete';
import EditModule from 'wishlist-bot/modules/editing/edit';
import UpdateDescriptionModule from 'wishlist-bot/modules/editing/update-description';
import UpdateNameModule from 'wishlist-bot/modules/editing/update-name';
import UpdatePriorityModule from 'wishlist-bot/modules/editing/update-priority';

const configure = (bot) => {
  console.log('configuring editing module');
  configureModules(bot, [
    EditModule,
    UpdatePriorityModule,
    CancelUpdatePriorityModule,
    UpdateNameModule,
    CancelUpdateNameModule,
    UpdateDescriptionModule,
    CancelUpdateDescriptionModule,
    DeleteModule,
    AddModule,
    CancelAddModule,
    ClearListModule,
    CancelClearListModule,
  ]);
};

export default { configure };
