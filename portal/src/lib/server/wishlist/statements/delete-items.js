import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { DeleteItems } from '../events.js';

/**
 * Создание и выполнение SQL выражений для удаления нескольких элементов списка желаний
 * @function deleteItems
 * @param {number} userid Идентифкатор пользователя — владельца списка
 * @param {number[]} ids Идентификаторы удаляемых элементов списка
 * @returns {{ changes: number }} Количество удалённых элементов списка
 */
const deleteItems = (userid, ids) => {
  if (ids.length <= 0) {
    return { changes: 0 };
  }

  const db = inject(Database);

  const idPlaceholders = ids.map(() => '?').join(', ');
  const statements = [
    `DELETE FROM description_entities WHERE list_item_id IN (${idPlaceholders})`,
    `DELETE FROM participants WHERE list_item_id IN (${idPlaceholders})`,
    `DELETE FROM list WHERE id IN (${idPlaceholders}) AND userid = ?`,
  ];

  for (const statement of statements.slice(0, -1)) {
    db.prepare(statement).run(ids);
  }

  return db.prepare(statements.at(-1)).run(...ids, userid);
};

/**
 * Подписка [выполнения SQL выражений]{@link deleteItems} на соответствующее событие
 * @function initDeleteItemsStatements
 * @returns {void}
 */
export const initDeleteItemsStatements = () => {
  subscribe(DeleteItems, deleteItems);
};
