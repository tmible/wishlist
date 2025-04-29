import { initAddItemStatement } from './statements/add-item.js';
import { initDeleteDescriptionEntitiesStatement } from './statements/delete-description-entities.js';
import { initDeleteItemStatements } from './statements/delete-item.js';
import { initDeleteItemsStatements } from './statements/delete-items.js';
import { initGetItemStatement } from './statements/get-item.js';
import { initGetWishlistStatement } from './statements/get-wishlist.js';
import { initInsertDescriptionEntitiesStatement } from './statements/insert-description-entities.js';
import { initReorderWishlistStatement } from './statements/reorder-wishlist.js';
import { initUpdateItemStatement } from './statements/update-item.js';

/**
 * Подготовка SQL выражений для работы со списком желаний
 * @function initWishlistFeature
 * @returns {void}
 */
export const initWishlistFeature = () => {
  initGetWishlistStatement();
  initAddItemStatement();
  initGetItemStatement();
  initInsertDescriptionEntitiesStatement();
  initReorderWishlistStatement();
  initDeleteItemsStatements();
  initUpdateItemStatement();
  initDeleteDescriptionEntitiesStatement();
  initDeleteItemStatements();
};
