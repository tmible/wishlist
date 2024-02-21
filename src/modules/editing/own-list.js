import { subscribe } from '@tmible/wishlist-bot/store/event-bus';
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
   * При получении команды /my_list бот
   * [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
   */
  bot.command('my_list', (ctx) => sendList(ctx));

  /**
   * При вызове действия обновления собственного списка бот
   * [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
   */
  bot.action('update_own_list', (ctx) => sendList(ctx));

  /**
   * При вызове действия отправки собственного списка новыми сообщениями бот
   * [отправляет обновлённый список (см. параметр shouldForceNewMessages)]{@link sendList}
   */
  bot.action('force_own_list', (ctx) => sendList(ctx, { shouldForceNewMessages: true }));

  /**
   * При выпуске события запроса собственного списка (для случаев вызова команды /list
   * с собственным идентификатором или именем) бот
   * [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
   */
  subscribe(Events.Wishlist.HandleOwnList, sendList);
};

export default { configure };
