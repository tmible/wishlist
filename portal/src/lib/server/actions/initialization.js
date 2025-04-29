import { initAddActionStatement } from './statements/add-action.js';

/**
 * Подготовка SQL выражений для работы с действиями
 * @function initActionsFeature
 * @returns {void}
 */
export const initActionsFeature = () => {
  initAddActionStatement();
};
