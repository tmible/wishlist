import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { CountBotUserUpdates } from '../events.js';
import { filtersToString } from '../filters-to-string.js';

/**
 * @typedef {
 *   import('$lib/bot-user-updates/initialization.js').BotUserUpdatesFilters
 * } BotUserUpdatesFilters
 */

/**
 * Создание и выполенение SQL выражения для подсчёта в БД с логами части полученных ботом обновлений
 * @function countBotUserUpdates
 * @param {number} timeLock Таймштамп, позже которого выбираются записи
 * @param {BotUserUpdatesFilters} filters Фильтры обновлений
 * @returns {number} Количество обновлений, удовлетворяющих всем параметрам
 */
const countBotUserUpdates = (timeLock, filters = {}) => inject(Database).prepare(`
  SELECT COUNT(*) AS total
  FROM 'bot.logs'
  WHERE level = 30 AND msg = 'start processing update' AND time < ?${filtersToString(filters)}
`).get(timeLock).total;

/**
 * Подписка [создания и выполнения SQL выражения]{@link countBotUserUpdates}
 * на соответствующее событие
 * @function initCountBotUserUpdatesStatement
 * @returns {void}
 */
export const initCountBotUserUpdatesStatement = () => {
  subscribe(CountBotUserUpdates, countBotUserUpdates);
};
