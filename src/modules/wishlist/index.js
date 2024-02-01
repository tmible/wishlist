import configureModules from '@tmible/wishlist-bot/helpers/configure-modules';
import BookModule from './book.js';
import CancelListModule from './cancel-list.js';
import CooperateModule from './cooperate.js';
import ListModule from './list.js';
import RetireModule from './retire.js';

/**
 * Настройка модуля просмотра списков желаний
 * других пользователей и взаимодействия с ними
 * @function configure
 */
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
