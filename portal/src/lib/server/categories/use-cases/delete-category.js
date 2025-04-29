import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { RunStatementAuthorized } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { DeleteCategory } from '../events.js';

/** @typedef {import('../initialization.js').Category} Category */

/** @module Сценарий удаления категории */

/**
 * Удаление категории
 * @function deleteCategory
 * @param {number} userid Идентифкатор пользователя — владельца категории
 * @param {Category['id']} id Идентификатор удаляемой категории
 * @returns {void}
 */
export const deleteCategory = (userid, id) => {
  emit(
    RunStatementAuthorized,
    () => emit(DeleteCategory, userid, id),
    1,
  );

  inject(IPCHub).sendMessage(`update ${userid}`);
};
