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
   * При получении команды /my_list бот
   * [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
   */
  bot.command('my_list', (ctx) => sendList(eventBus, ctx));

  /**
   * При вызове действия обновления собственного списка бот
   * [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
   */
  bot.action('update_own_list', (ctx) => sendList(eventBus, ctx));

  /**
   * При вызове действия отправки собственного списка новыми сообщениями бот
   * [отправляет обновлённый список (см. параметр shouldForceNewMessages)]{@link sendList}
   */
  bot.action('force_own_list', (ctx) => sendList(eventBus, ctx, { shouldForceNewMessages: true }));

  /**
   * При выпуске события запроса собственного списка (для случаев вызова команды /list
   * с собственным идентификатором или именем) бот
   * [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
   */
  eventBus.subscribe(Events.Wishlist.HandleOwnList, (ctx) => sendList(eventBus, ctx));
};

export default { configure };
