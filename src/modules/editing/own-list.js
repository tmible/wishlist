import { subscribe } from '@tmible/wishlist-bot/store/event-bus';
import Events from '@tmible/wishlist-bot/store/events';
import sendList from './helpers/send-list.js';

/**
 * При получении команды /my_list бот
 * [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
 *
 * При вызове действия отправки собственного списка новыми сообщениями бот
 * [отправляет обновлённый список (см. аргумент shouldForceNewMessages)]{@link sendList}
 *
 * При выпуске события запроса собственного списка (для случаев вызова команды /list
 * с собственным идентификатором или именем) бот
 * [отправляет обновлённый или обновляет отправленный ранее список]{@link sendList}
 */
const configure = (bot) => {
  bot.command('my_list', (ctx) => sendList(ctx));
  bot.action('force_own_list', (ctx) => sendList(ctx, { shouldForceNewMessages: true }));
  subscribe(Events.Wishlist.HandleOwnList, sendList);
};

export default { configure };
