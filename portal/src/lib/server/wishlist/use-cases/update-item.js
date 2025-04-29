import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import {
  LACK_OF_DATA_ERROR_MESSAGE,
} from '$lib/server/constants/lack-of-data-error-message.const.js';
import { RunStatementAuthorized, RunTransaction } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { DeleteDescriptionEntities, InsertDescriptionEntities, UpdateItem } from '../events.js';

/** @typedef {import('$lib/wishlist/domain.js').OwnWishlistItemFormData} OwnWishlistItemFormData */

/** @module Сценарий обновления элемента списка желаний */

/**
 * Названия атрибутов элемента списка. Используется
 * для отделения данных от метаданных в теле запроса
 * @constant {Set<string>}
 */
const LIST_ITEM_PROPERTIES = new Set([
  'name',
  'description',
  'descriptionEntities',
  'order',
  'categoryId',
]);

/**
 * Обновление элемента списка желаний
 * @function updateItem
 * @param {number} userid Идентифкатор пользователя — владельца списка
 * @param {number} id Идентификатор обновляемого элемента списка
 * @param {Partial<OwnWishlistItemFormData>} patch Объект с изменениями
 * @returns {void}
 * @throws {Error} Ошибка в случае отсутствия изменений
 */
export const updateItem = (userid, id, patch) => {
  const keysToUpdate = Object.keys(patch).filter((key) => LIST_ITEM_PROPERTIES.has(key));

  if (keysToUpdate.length <= 0) {
    throw new Error(LACK_OF_DATA_ERROR_MESSAGE);
  }

  emit(
    RunTransaction,
    () => {
      if (keysToUpdate.some((key) => key !== 'descriptionEntities')) {
        emit(RunStatementAuthorized, () => emit(UpdateItem, userid, id, keysToUpdate, patch), 1);
      }
      if (keysToUpdate.includes('descriptionEntities')) {
        emit(DeleteDescriptionEntities, id);
        emit(InsertDescriptionEntities, id, patch.descriptionEntities ?? []);
      }
    },
  );

  inject(IPCHub).sendMessage(`update ${userid}`);
};
