import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { LOGS_DB_FILE_PATH, LOGS_DB_MIGRATIONS_PATH } from '$env/static/private';
import { Database as DatabaseInjectionToken } from './injection-tokens.js';

/**
 * Создание подключения к БД с логами с отложенным закрытием,
 * миграции БД, регистрация БД в сервисе внедрения зависмостей
 * @function initDB
 * @returns {void}
 */
export const initDB = () => {
  const db = new Database(LOGS_DB_FILE_PATH);
  migrate(db, LOGS_DB_MIGRATIONS_PATH);
  provide(DatabaseInjectionToken, db);
  process.on('sveltekit:shutdown', () => db.close());
};
