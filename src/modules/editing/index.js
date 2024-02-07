import configureModules from '@tmible/wishlist-bot/helpers/configure-modules';
import AddModule from './add.js';
import CancelAddModule from './cancel-add.js';
import CancelClearListModule from './cancel-clear-list.js';
import CancelUpdateDescriptionModule from './cancel-update-description.js';
import CancelUpdateNameModule from './cancel-update-name.js';
import CancelUpdatePriorityModule from './cancel-update-priority.js';
import ClearListModule from './clear-list.js';
import DeleteModule from './delete.js';
import EditModule from './edit.js';
import UpdateDescriptionModule from './update-description.js';
import UpdateNameModule from './update-name.js';
import UpdatePriorityModule from './update-priority.js';

/**
 * Настройка модуля, обеспечивающего работу пользователя со своим списком желаний
 * @function configure
 */
const configure = (bot) => {
  console.log('configuring editing module');
  return configureModules(bot, [
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
