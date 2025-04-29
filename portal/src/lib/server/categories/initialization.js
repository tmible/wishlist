import { initAddCategoryStatement } from './statements/add-category.js';
import { initDeleteCategoryStatement } from './statements/delete-category.js';
import { initGetCategoriesStatement } from './statements/get-categories.js';
import { initUpdateCategoryStatement } from './statements/update-category.js';

/** @typedef {{ id: number, name: string }} Category */

/**
 * Подготовка SQL выражений для работы с категориями
 * @function initCategoriesFeature
 * @returns {void}
 */
export const initCategoriesFeature = () => {
  initGetCategoriesStatement();
  initAddCategoryStatement();
  initUpdateCategoryStatement();
  initDeleteCategoryStatement();
};
