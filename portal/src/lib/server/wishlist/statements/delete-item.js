import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { DeleteItem } from '../events.js';

/**
 * Создание и выполнение SQL выражений для удаления одного элемента из списка желаний.
 * Подписка выполнения SQL выражений на соответствующее событие
 * @function initDeleteItemStatements
 * @returns {void}
 */
export const initDeleteItemStatements = () => {
  const db = inject(Database);
  const statements = [
    db.prepare('DELETE FROM description_entities WHERE list_item_id = ?'),
    db.prepare('DELETE FROM participants WHERE list_item_id = ?'),
    db.prepare('DELETE FROM list WHERE id = ? AND userid = ?'),
  ];
  subscribe(
    DeleteItem,
    (userid, id) => {
      for (const statement of statements.slice(0, -1)) {
        statement.run(id);
      }
      return statements.at(-1).run(id, userid);
    },
  );
};
