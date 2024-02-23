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
   * При вызове действия удаления подарка из списка желаний
   * бот выпускает соответствующее событие,
   * и [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
   */
  bot.action(/^delete (\d+)$/, async (ctx) => {
    eventBus.emit(Events.Editing.DeleteItems, [ ctx.match[1] ]);
    await sendList(eventBus, ctx, { shouldSendNotification: false });
  });
};

export default { configure };
