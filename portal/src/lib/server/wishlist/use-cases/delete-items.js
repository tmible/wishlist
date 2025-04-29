import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import {
  LACK_OF_DATA_ERROR_MESSAGE,
} from '$lib/server/constants/lack-of-data-error-message.const.js';
import { RunStatementAuthorized } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { DeleteItems } from '../events.js';

/** @module Сценарий удаления нескольких элементов из списка желаний */

/**
 * Удаление нескольких элементов из списка желаний
 * @function deleteItems
 * @param {number} userid Идентифкатор пользователя — владельца списка
 * @param {number[]} ids Идентификаторы удаляемых элементов списка
 * @returns {void}
 * @throws {Error} Ошибка в случае передачи пустого массива ids
 */
export const deleteItems = (userid, ids) => {
  if (ids.length <= 0) {
    throw new Error(LACK_OF_DATA_ERROR_MESSAGE);
  }
  emit(RunStatementAuthorized, () => emit(DeleteItems, userid, ids), ids.length);
  inject(IPCHub).sendMessage(`update ${userid}`);
};
