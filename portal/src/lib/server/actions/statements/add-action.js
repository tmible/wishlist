import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Database } from '$lib/server/logs-db/injection-tokens.js';
import { AddAction } from '../events.js';

/**
 * Создание SQL выражения для сохранения действий.
 * Подписка выполнения SQL выражения на соответствующее событие
 * @function initAddActionStatement
 * @returns {void}
 */
export const initAddActionStatement = () => {
  const statement = inject(
    Database,
  ).prepare(
    'INSERT INTO "portal.actions" (timestamp, action, unknownUserUuid) VALUES (?, ?, ?)',
  );
  subscribe(
    AddAction,
    (timestamp, action, unknownUserUuid) => statement.run(timestamp, action, unknownUserUuid),
  );
};
