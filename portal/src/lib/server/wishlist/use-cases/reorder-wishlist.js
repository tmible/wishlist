import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import {
  LACK_OF_DATA_ERROR_MESSAGE,
} from '$lib/server/constants/lack-of-data-error-message.const.js';
import { RunStatementAuthorized } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { ReorderWishlist } from '../events.js';

/** @typedef {import('$lib/wishlist/use-cases/reorder-list.js').ReorderPatch} ReorderPatch */

/** @module Сценарий переупорядочивания списка желаний */

/**
 * Переупорядочивание списка желаний
 * @function reorderWishlist
 * @param {number} userid Идентифкатор пользователя — владельца списка
 * @param {ReorderPatch} patch Отображение идентификаторов элементов списка в порядковый номер
 * @returns {void}
 * @throws {Error} Ошибка в случае передачи пустого patch
 */
export const reorderWishlist = (userid, patch) => {
  if (patch.length <= 0) {
    throw new Error(LACK_OF_DATA_ERROR_MESSAGE);
  }
  emit(RunStatementAuthorized, () => emit(ReorderWishlist, userid, patch), patch.length);
  inject(IPCHub).sendMessage(`update ${userid}`);
};
