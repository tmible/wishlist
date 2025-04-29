import { emit } from '@tmible/wishlist-common/event-bus';
import sha256 from '@tmible/wishlist-common/sha-256';
import { GetUserHash, SetUserHash } from '../events.js';

/** @module Сценарий получения хэша пользователя */

/**
 * Получение хэша из БД, вычисление и сохранение нового при отсутствии
 * @function getUserHash
 * @param {number} userid Идентификатор пользователя
 * @returns {Promise<string>} Хэш
 */
export const getUserHash = async (userid) => {
  let hash = emit(GetUserHash, userid);

  // eslint-disable-next-line security/detect-possible-timing-attacks -- Сравнение с null
  if (hash === null) {
    hash = await sha256(userid);
    hash = hash.slice(0, 7);
    emit(SetUserHash, hash, userid);
  }

  return hash;
};
