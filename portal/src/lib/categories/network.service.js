/** @typedef {import('./domain.js').Category} Category */

/** @module Сетевой сервис категорий */

/**
 * Получение категорий
 * @function getCategories
 * @returns {Promise<[ Category[], boolean ]>} Полученные категории и признак успешного запроса
 * @async
 */
export const getCategories = async () => {
  const response = await fetch('/api/wishlist/categories');
  return [ await response.json(), response.ok ];
};

/**
 * Создание категории
 * @function createCategory
 * @param {Omit<Category, 'id'>} category Создаваемая категория
 * @returns {Promise<[ Category['id'], boolean ]>}
 *   Идентификатор созданной категории и признак успешного запроса
 * @async
 * @throws {Error} Ошибка, если сервер не прислал заголовок Location
 *   или в нём не удалось найти идентификатор
 */
export const createCategory = async ({ name }) => {
  const response = await fetch('/api/wishlist/categories', { method: 'POST', body: name });
  const id = response.headers.get('Location')?.match(/\/\d+$/)?.[0].slice(1);
  if (!id) {
    throw new Error('Server did not return id of created category');
  }
  return [ Number.parseInt(id), response.ok ];
};

/**
 * Обновление категории
 * @function updateCategory
 * @param {Category} category Обновляемая категория
 * @returns {Promise<[ undefined, boolean ]>} Признак успешного запроса
 * @async
 */
export const updateCategory = async ({ id, name }) => await fetch(
  `/api/wishlist/categories/${id}`,
  { method: 'PUT', body: name },
).then(
  ({ ok }) => [ undefined, ok ],
);

/**
 * Удаление категории
 * @function deleteCategory
 * @param {Category} category Удаляемая категория
 * @returns {Promise<[ undefined, boolean ]>} Признак успешного запроса
 * @async
 */
export const deleteCategory = async ({ id }) => await fetch(
  `/api/wishlist/categories/${id}`,
  { method: 'DELETE' },
).then(
  ({ ok }) => [ undefined, ok ],
);
