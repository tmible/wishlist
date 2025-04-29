/** @module Домен категорий */

/**
 * Категория элементов списка желаний пользователя
 * @typedef {object} Category
 * @property {number} id Идентификатор категории
 * @property {string} name Название категории
 */

/**
 * Проверка наличия различий в двух экземплярах категории.
 * Оба объекта должны быть экземплярами одной и той же категории
 * @function isCategoryEdited
 * @param {Category} category Оригинальный экземпляр категории
 * @param {Category} editedCategory Изменённый экземпляр категории
 * @returns {boolean} Признак наличия различий
 */
export const isCategoryEdited = (
  category,
  editedCategory,
) => category.id === editedCategory.id && category.name !== editedCategory.name;
