import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { ReorderWishlist } from '../events.js';

/** @typedef {import('$lib/wishlist/use-cases/reorder-list.js').ReorderPatch} ReorderPatch */

/**
 * Создание и выполнение SQL выражения для переупорядочивания элементов списка желаний
 * @function reorderWishlist
 * @param {number} userid Идентифкатор пользователя — владельца списка
 * @param {ReorderPatch} patch Отображение идентификаторов элементов списка в порядковый номер
 * @returns {{ changes: number }} Количество перемещённых элементов списка
 */
const reorderWishlist = (userid, patch) => {
  if (patch.length <= 0) {
    return { changes: 0 };
  }

  return inject(Database).prepare(`
    WITH patch(id, "order") AS (VALUES ${patch.map(() => '(?, ?)').join(', ')})
    UPDATE list SET "order" = patch."order"
    FROM patch
    WHERE list.id = patch.id AND userid = ?
  `).run(...patch.flatMap(({ id, order }) => [ id, order ]), userid);
};

/**
 * Подписка [выполнения SQL выражения]{@link reorderWishlist} на соответствующее событие
 * @function initReorderWishlistStatement
 * @returns {void}
 */
export const initReorderWishlistStatement = () => {
  subscribe(ReorderWishlist, reorderWishlist);
};
