import { emit } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import sendList from './helpers/send-list.js';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/helpers/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  /**
   * При вызове действия добавления в кооперацию по подарку
   * [выпуск]{@link emit} соответсвующего события
   * и [отправка обновлённого или обновление отправленного ранее списка]{@link sendList}
   */
  bot.action(/^cooperate (\d+) (\d+)$/, async (ctx) => {
    emit(Events.Wishlist.CooperateOnItem, Number.parseInt(ctx.match[1]), ctx.from.id);
    await sendList(ctx, Number.parseInt(ctx.match[2]));
  });
};

export default { configure };
