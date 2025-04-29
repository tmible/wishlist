import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/db/injection-tokens.js';
import { DeleteDescriptionEntities } from '../events.js';

/**
 * Создание SQL выражения для удаления элементов разметки описания из БД.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initDeleteDescriptionEntitiesStatement
 * @returns {void}
 */
export const initDeleteDescriptionEntitiesStatement = () => {
  const statement = inject(Database).prepare(
    'DELETE FROM description_entities WHERE list_item_id = ?',
  );
  subscribe(DeleteDescriptionEntities, (id) => statement.run(id));
};
