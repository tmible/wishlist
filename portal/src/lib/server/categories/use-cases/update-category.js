import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { RunStatementAuthorized } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { UpdateCategory } from '../events.js';

/** @typedef {import('../initialization.js').Category} Category */

/** @module Сценарий изменения названия категории */

/**
 * Изменение названия категории
 * @function updateCategory
 * @param {number} userid Идентифкатор пользователя — владельца категории
 * @param {Category} category Изменяемая категория
 * @returns {void}
 */
export const updateCategory = (userid, category) => {
  emit(
    RunStatementAuthorized,
    () => emit(UpdateCategory, userid, category),
    1,
  );

  inject(IPCHub).sendMessage(`update ${userid}`);
};
