import { emit } from '@tmible/wishlist-common/event-bus';
import { CountBotUserUpdates, GetBotUserUpdates } from '../events.js';

/**
 * @typedef {import('$lib/bot-user-updates/initialization.js').BotUserUpdatesDTO} BotUserUpdatesDTO
 */
/**
 * @typedef {
 *   import('$lib/bot-user-updates/initialization.js').BotUserUpdatesFilters
 * } BotUserUpdatesFilters
 */

/** @module Сценарий получения части обновлений, полученных ботом */

/**
 * Получение обновлений
 * @function getBotUserUpdates
 * @param {object} params Параметры запроса
 * @param {number} [params.timeLock] Таймштамп, позже которого выбираются обновления
 * @param {number} [params.index] Индекс страницы
 * @param {BotUserUpdatesFilters} [params.filters] Фильтры обновлений
 * @returns {BotUserUpdatesDTO} Часть обновлений,
 *   удовлетворяющая всем параметрам, её порядковый номер и общее количество удовлетворяющих
 *   всем параметрам обновлений
 */
export const getBotUserUpdates = ({
  timeLock = Date.now(),
  index = 0,
  filters = {},
}) => {
  let finalIndex = index;
  let page = emit(GetBotUserUpdates, timeLock, index, filters);

  while (finalIndex > 0 && page.length === 0) {
    finalIndex -= 1;
    page = emit(GetBotUserUpdates, timeLock, finalIndex, filters);
  }

  return {
    page,
    index: finalIndex,
    total: emit(CountBotUserUpdates, timeLock, filters),
  };
};
