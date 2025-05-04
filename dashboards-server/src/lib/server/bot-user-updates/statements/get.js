import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import {
  BOT_USER_UPDATES_TABLE_PAGE_SIZE,
} from '$lib/constants/bot-user-updates-table-page-size.const.js';
import { Database } from '$lib/server/db/injection-tokens.js';
import { GetBotUserUpdates } from '../events.js';
import { filtersToString } from '../filters-to-string.js';

/**
 * @typedef {import('$lib/bot-user-updates/initialization.js').BotUserUpdate} BotUserUpdate
 */
/**
 * @typedef {
 *   import('$lib/bot-user-updates/initialization.js').BotUserUpdatesFilters
 * } BotUserUpdatesFilters
 */

/**
 * Создание и выполнение SQL выражения
 * для получения из БД с логами части полученных ботом обновлений
 * @function getBotUserUpdates
 * @param {number} timeLock Таймштамп, позже которого выбираются записи
 * @param {number} page Индекс страницы
 * @param {BotUserUpdatesFilters} filters Фильтры обновлений
 * @returns {BotUserUpdate[]} Часть обновлений, удовлетворяющая всем параметрам
 */
const getBotUserUpdates = (timeLock, page, filters = {}) => inject(Database).prepare(`
  SELECT time, chatId, userid, updateType, updatePayload
  FROM 'bot.logs'
  WHERE level = 30 AND msg = 'start processing update' AND time < ?${filtersToString(filters)}
  ORDER BY time DESC
  LIMIT ${BOT_USER_UPDATES_TABLE_PAGE_SIZE}
  OFFSET ? * ${BOT_USER_UPDATES_TABLE_PAGE_SIZE}
`).all(timeLock, page);

/**
 * Подписка [создания и выполнения SQL выражения]{@link getBotUserUpdates}
 * на соответствующее событие
 * @function initGetBotUserUpdatesStatement
 * @returns {void}
 */
export const initGetBotUserUpdatesStatement = () => {
  subscribe(GetBotUserUpdates, getBotUserUpdates);
};
