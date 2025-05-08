/** @typedef {import('$lib/wishlist/domain.js').OwnWishlistItem} OwnWishlistItem */

/** @module Домен списка желаний */

/**
 * Присовение порядкового номера новому (добавляемому) подарку
 * @function assignOrderToNewItem
 * @param {OwnWishlistItem[]} list Текущий список
 * @param {Partial<OwnWishlistItem>} itemToAdd Добавляемый подарок
 * @returns {void}
 */
export const assignOrderToNewItem = (list, itemToAdd) => {
  itemToAdd.order = list.length;
};

/**
 * Отметка подарка сюрпризом
 * @function markExernallyAddedItem
 * @param {OwnWishlistItem} item Добавляемый подарок
 * @param {number} addedBy Идентификтор пользователя, добавившего подрарок в список желаний
 * @returns {void}
 */
export const markExernallyAddedItem = (item, addedBy) => {
  item.addedBy = addedBy;
};
