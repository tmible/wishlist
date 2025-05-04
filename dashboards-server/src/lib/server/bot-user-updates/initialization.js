import { initCountBotUserUpdatesStatement } from './statements/count.js';
import { initGetBotUserUpdatesStatement } from './statements/get.js';

/**
 * Подготовка SQL выражений для работы с обновлениями, полученными ботом
 * @function initBotUserUpdatesFeature
 * @returns {void}
 */
export const initBotUserUpdatesFeature = () => {
  initGetBotUserUpdatesStatement();
  initCountBotUserUpdatesStatement();
};
