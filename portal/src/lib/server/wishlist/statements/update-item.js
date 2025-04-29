import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { UpdateItem } from '../events.js';

/** @typedef {import('$lib/wishlist/domain.js').OwnWishlistItemFormData} OwnWishlistItemFormData */

/**
 * Отображение названий атрибутов элемента списка из запроса в названия атрибутов в БД.
 * Не упомянутые совпадают
 * @constant {Map<string, string>}
 */
const LIST_ITEM_PROPERTIES_TO_DB_COLUMNS = new Map([
  [ 'categoryId', 'category_id' ],
]);

/**
 * Создание SQL выражения для обновления элемента списка желаний
 * @function updateItem
 * @param {number} userid Идентифкатор пользователя — владельца списка
 * @param {number} id Идентификатор обновляемого элемента списка
 * @param {(keyof OwnWishlistItemFormData)[]} keysToUpdate Названия атрибутов с изменениями
 * @param {Partial<OwnWishlistItemFormData>} patch Объект с изменениями
 * @returns {{ changes: number }} Количество обновлённых элементов списка
 */
const updateItem = (userid, id, keysToUpdate, patch) => {
  const keysToUpdateFiltered = keysToUpdate.filter((key) => key !== 'descriptionEntities');

  if (keysToUpdateFiltered.length <= 0) {
    return { changes: 0 };
  }

  const updatePairs = keysToUpdateFiltered.map(
    (key) => {
      const column = LIST_ITEM_PROPERTIES_TO_DB_COLUMNS.get(key) ?? key;
      const value = patch[key] === null ? patch[key] : `'${patch[key]}'`;
      return `${column} = ${value}`;
    },
  );

  return inject(Database).prepare(
    `UPDATE list SET ${updatePairs.join(', ')} WHERE id = ? AND userid = ?`,
  ).run(
    id,
    userid,
  );
};

/**
 * Подписка [выполнения SQL выражения]{@link updateItem} на соответствующее событие
 * @function initUpdateItemStatement
 * @returns {void}
 */
export const initUpdateItemStatement = () => {
  subscribe(UpdateItem, updateItem);
};
