import { inject } from '@tmible/wishlist-common/dependency-injector';
import { Database } from './injection-tokens.js';

/**
 * Выполнение транзакции
 * @function runTransaction
 * @param {() => void} transaction Функция транзакции
 * @returns {void}
 */
export const runTransaction = (transaction) => {
  inject(Database).transaction(transaction)();
};
