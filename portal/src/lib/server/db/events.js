/** @module События адаптера БД */

/**
 * Событие выполнения транзакции
 * @constant {string}
 */
export const RunTransaction = 'run transaction';

/**
 * Событие выполнения SQL выражения с проверкой авторизации
 * @constant {string}
 */
export const RunStatementAuthorized = 'run statement authorized';
