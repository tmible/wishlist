import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { RunTransaction } from '$lib/server/db/events.js';
import { IPCHub } from '$lib/server/ipc-hub/injection-tokens.js';
import { GetUseridByHash } from '$lib/server/user/events.js';
import { assignOrderToNewItem, markExernallyAddedItem } from '../domain.js';
import { AddItem, GetWishlist, InsertDescriptionEntities } from '../events.js';

/** @typedef {import('$lib/wishlist/domain.js').OwnWishlistItem} OwnWishlistItem */
/** @typedef {import('$lib/wishlist/domain.js').OwnWishlistItemFormData} OwnWishlistItemFormData */

/** @module Сценарий добавления сюрприза к списку желаний */

/**
 * Добавление сюрприза
 * @function addItemExternally
 * @param {string} targetUserHash Хэш пользователя — владельца списка
 * @param {OwnWishlistItemFormData} item Добавляемый сюрприз
 * @param {number} userid Идентифкатор пользователя, добавляющего сюрприз
 * @returns {void}
 */
export const addItemExternally = (targetUserHash, item, userid) => {
  const targetUserid = emit(GetUseridByHash, targetUserHash);
  assignOrderToNewItem(emit(GetWishlist, targetUserid), item);
  markExernallyAddedItem(item, userid);
  emit(
    RunTransaction,
    () => {
      const { id: itemId } = emit(AddItem, targetUserid, item);
      emit(InsertDescriptionEntities, itemId, item.descriptionEntities);
    },
  );
  inject(IPCHub).sendMessage(`update ${targetUserid}`);
};
