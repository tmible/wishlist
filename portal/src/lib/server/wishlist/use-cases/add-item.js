import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { RunTransaction } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { AddItem, GetItem, InsertDescriptionEntities } from '../events.js';

/** @typedef {import('$lib/wishlist/domain.js').OwnWishlistItem} OwnWishlistItem */
/** @typedef {import('$lib/wishlist/domain.js').OwnWishlistItemFormData} OwnWishlistItemFormData */

/** @module Сценарий добавления элемента к списку желаний */

/**
 * Добавление элемента
 * @function addItem
 * @param {number} userid Идентифкатор пользователя — владельца списка
 * @param {OwnWishlistItemFormData} item Добавляемый элемент
 * @returns {OwnWishlistItem['id']} Идентификатор добавленного элемента
 */
export const addItem = (userid, item) => {
  let addedItem;
  emit(
    RunTransaction,
    () => {
      const { id: itemId } = emit(AddItem, userid, item);
      emit(InsertDescriptionEntities, itemId, item.descriptionEntities);
      addedItem = emit(GetItem, itemId);
    },
  );
  inject(IPCHub).sendMessage(`update ${userid}`);
  return addedItem;
};
