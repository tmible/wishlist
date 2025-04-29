/** @module События списка желаний */

/**
 * Событие получения списка
 * @constant {string}
 */
export const GetWishlist = 'get wishlist';

/**
 * Событие добавления элемента к списку
 * @constant {string}
 */
export const AddItem = 'add item';

/**
 * Событие сохранения элементов разметки описания
 * @constant {string}
 */
export const InsertDescriptionEntities = 'insert description entities';

/**
 * Событие получения элемента
 * @constant {string}
 */
export const GetItem = 'get item';

/**
 * Событие получения функции, подсчитывающей количество элементов списка желаний,
 * принадлежащих пользователю, среди указанных
 * @constant {string}
 */
export const GetWishlistItemsCounter = 'get wishlist items counter';

/**
 * Событие переупорядочивания списка
 * @constant {string}
 */
export const ReorderWishlist = 'reorder wishlist';

/**
 * Событие удаления нескольких элементов из списка
 * @constant {string}
 */
export const DeleteItems = 'delete items';

/**
 * Событие обновления элемента списка
 * @constant {string}
 */
export const UpdateItem = 'update item';

/**
 * Событие удаления элементов разметки описания
 * @constant {string}
 */
export const DeleteDescriptionEntities = 'delete description entities';

/**
 * Событие удаления одного элемента из списка
 * @constant {string}
 */
export const DeleteItem = 'delete item';
