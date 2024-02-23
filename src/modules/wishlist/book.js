import { inject } from '@tmible/wishlist-bot/architecture/dependency-injector';
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
   * При вызове действия бронирования подарка выпуск соответсвующего события
   * и [отправка обновлённого или обновление отправленного ранее списка]{@link sendList}
   */
  bot.action(/^book (\d+) (\d+)$/, async (ctx) => {
    eventBus.emit(Events.Wishlist.BookItem, Number.parseInt(ctx.match[1]), ctx.from.id);
    await sendList(eventBus, ctx, Number.parseInt(ctx.match[2]));
  });
};

export default { configure };
