import { inject } from '@tmible/wishlist-common/dependency-injector';
import {
  AUTHORIZATION_ERROR_MESSAGE,
} from '$lib/server/constants/authorization-error-message.const.js';
import { Database } from './injection-tokens.js';

/**
 * Выполнение транзакции с проверкой количества изменённых сущностей.
 * Если оно не совпадает с целевым, транзакция прерывается с ошибкой авторизации.
 * Таким образом обеспечивается эксклюзивность права пользователя на изменение и удаление
 * принадлежащих ему сущностей
 * @function runStatementAuthorized
 * @param {() => { changes: number }} runStatement Функция, выполняющая целевое SQL выражение
 * @param {number} targetChanges Целевое количество принадлежащих пользователю сущностей
 * @returns {void}
 * @throws {Error} Ошибка в случае несовпадения целевого и фактического количества
 *   принадлежащих пользователю сущностей
 */
export const runStatementAuthorized = (runStatement, targetChanges) => {
  inject(Database).transaction(() => {
    const { changes } = runStatement();
    if (changes !== targetChanges) {
      throw new Error(AUTHORIZATION_ERROR_MESSAGE);
    }
  })();
};
