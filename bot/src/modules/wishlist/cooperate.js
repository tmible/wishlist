import { inject } from '@tmible/wishlist-common/dependency-injector';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import sendList from './helpers/send-list.js';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  const eventBus = inject(InjectionToken.EventBus);

  /**
   * При вызове действия добавления в кооперацию по подарку
   * выпуск соответсвующего события
   * и [отправка обновлённого или обновление отправленного ранее списка]{@link sendList}
   */
  bot.action(/^cooperate (\d+) (\d+)$/, async (ctx) => {
    eventBus.emit(Events.Wishlist.CooperateOnItem, Number.parseInt(ctx.match[1]), ctx.from.id);
    await sendList(eventBus, ctx, Number.parseInt(ctx.match[2]));
  });
};

export default { configure };
