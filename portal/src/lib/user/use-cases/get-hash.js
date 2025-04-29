import { inject } from '@tmible/wishlist-common/dependency-injector';
import { setUserHash } from '../domain.js';
import { NetworkService, Store } from '../injection-tokens.js';

/** @module Сценарий получения хэша пользователя */

/**
 * Проверка наличия хэша в хранилище и запрос хэша, обновление хранилища при отсутствии
 * @function getHash
 * @returns {Promise<string>} Хэш пользователя
 * @async
 */
export const getHash = async () => {
  const store = inject(Store);
  const user = store.get();
  if (user.hash !== null) {
    return user.hash;
  }
  const hash = await inject(NetworkService).getHash();
  const userWithHash = setUserHash(user, hash);
  store.set(userWithHash);
  return hash;
};
