/** @typedef {import('./domain.js').OwnWishlistItem} OwnWishlistItem */
/** @typedef {import('./use-cases/reorder-list.js').ReorderPatch} ReorderPatch */

/** @module Сетевой сервис списка желаний */

/**
 * Получение списка
 * @function getList
 * @returns {Promise<[ OwnWishlistItem[], boolean ]>} Полученный список и признак успешного запроса
 * @async
 */
export const getList = async () => {
  const response = await fetch('/api/wishlist');
  return [ await response.json(), response.ok ];
};

/**
 * Форматирование элемента списка желаний для корректной
 * обработки на сервере при создании или изменении
 * @function formatPartialItemForServer
 * @param {Partial<OwnWishlistItem>} partialItem Элемент списка желаний
 * @returns {
 *   Partial<Omit<OwnWishlistItem, 'category'> & { categoryId: number | null }>
 * } Отфроматированный объект
 */
const formatPartialItemForServer = (partialItem) => {
  const partialItemForServer = { ...partialItem };

  if (Object.hasOwn(partialItemForServer, 'category')) {
    partialItemForServer.categoryId = partialItemForServer.category === null ?
      null :
      partialItemForServer.category.id;
    delete partialItemForServer.category;
  }

  return partialItemForServer;
};

/**
 * Добавление подарка к списку желаний. Если не указан targetUserHash,
 * добавляется к списку аутентифицированного пользователя
 * @function addItem
 * @param {Partial<OwnWishlistItem>} partialItem Добавляемый подарок
 * @param {string} [targetUserHash] Хэш пользователя, к списку которого добавляется подарок
 * @returns {Promise<[ OwnWishlistItem | null, boolean ]>} Добавленный подарок при добавлении
 *   в список аутентифицированного пользователя и признак успешного запроса
 * @async
 */
export const addItem = async (partialItem, targetUserHash) => {
  const query = targetUserHash ? `?wishlist=${targetUserHash}` : '';
  const response = await fetch(
    `/api/wishlist${query}`,
    { method: 'POST', body: JSON.stringify(formatPartialItemForServer(partialItem)) },
  );
  return [ await response.json(), response.ok ];
};

/**
 * Обновление элемента списка
 * @function patchItem
 * @param {OwnWishlistItem} item Обновляемый элемент списка
 * @param {Partial<OwnWishlistItem>} patch Объект с изменениями
 * @returns {Promise<[ undefined, boolean ]>} Признак успешного запроса
 * @async
 */
export const patchItem = async ({ id }, patch) => await fetch(
  `/api/wishlist/${id}`,
  { method: 'PATCH', body: JSON.stringify(formatPartialItemForServer(patch)) },
).then(
  ({ ok }) => [ undefined, ok ],
);

/**
 * Удаление одного элемента из списка
 * @function deleteItem
 * @param {OwnWishlistItem} item Удаляемый элемент
 * @returns {Promise<[ undefined, boolean ]>} Признак успешного запроса
 * @async
 */
export const deleteItem = async ({ id }) => await fetch(
  `/api/wishlist/${id}`,
  { method: 'DELETE' },
).then(
  ({ ok }) => [ undefined, ok ],
);


/**
 * Удаление нескольких элементов из списка
 * @function deleteItems
 * @param {OwnWishlistItem['id'][]} itemIds Идентификаторы удаляемых элементов
 * @returns {Promise<[ undefined, boolean ]>} Признак успешного запроса
 * @async
 */
export const deleteItems = async (itemIds) => await fetch(
  '/api/wishlist',
  { method: 'DELETE', body: JSON.stringify(itemIds) },
).then(
  ({ ok }) => [ undefined, ok ],
);

/**
 * Переупорядочивание списка
 * @function reorderList
 * @param {ReorderPatch} patch Отображение идентификаторов элементов списка в порядковый номер
 * @returns {Promise<[ undefined, boolean ]>} Признак успешного запроса
 * @async
 */
export const reorderList = async (patch) => await fetch(
  '/api/wishlist',
  { method: 'PATCH', body: JSON.stringify(patch) },
).then(
  ({ ok }) => [ undefined, ok ],
);
