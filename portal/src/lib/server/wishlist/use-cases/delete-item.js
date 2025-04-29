import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { RunStatementAuthorized } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { DeleteItem } from '../events.js';

/** @module Сценарий удаления одного элемента из списка желаний */

/**
 * Удаление одного элемента из списка желаний
 * @function deleteItem
 * @param {number} userid Идентифкатор пользователя — владельца списка
 * @param {number} id Идентификатор удаляемого элемента списка
 * @returns {void}
 */
export const deleteItem = (userid, id) => {
  emit(RunStatementAuthorized, () => emit(DeleteItem, userid, id), 1);
  inject(IPCHub).sendMessage(`update ${userid}`);
};
