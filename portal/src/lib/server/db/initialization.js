import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import Database from 'better-sqlite3';
import { WISHLIST_DB_FILE_PATH, WISHLIST_DB_MIGRATIONS_PATH } from '$env/static/private';
import { RunStatementAuthorized, RunTransaction } from './events.js';
import { Database as DatabaseInjectionToken } from './injection-tokens.js';
import { runStatementAuthorized } from './run-statement-authorized.js';
import { runTransaction } from './run-transaction.js';

/**
 * Создание подключения к БД с отложенным закрытием, миграции БД,
 * регистрация БД в сервисе внедрения зависмостей
 * @function initDB
 * @returns {void}
 */
export const initDB = () => {
  const db = new Database(WISHLIST_DB_FILE_PATH);
  migrate(db, WISHLIST_DB_MIGRATIONS_PATH);
  provide(DatabaseInjectionToken, db);
  process.on('sveltekit:shutdown', () => db.close());

  subscribe(RunTransaction, runTransaction);
  subscribe(RunStatementAuthorized, runStatementAuthorized);
};
