import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { LOGS_DB_FILE_PATH, LOGS_DB_MIGRATIONS_PATH } from '$env/static/private';
import { InjectionToken } from '$lib/architecture/injection-token';
import { initAddActionStatement } from './add-action-statement.js';

/**
 * Создание подключения к БД с логами с отложенным закрытием, миграции БД, регистрация БД в сервисе
 * внедрения зависмостей, инициализация всех подготовленных SQL выражений
 * @function initLogsDB
 * @returns {Promise<void>}
 * @async
 */
export const initLogsDB = async () => {
  const db = new Database(LOGS_DB_FILE_PATH);
  await migrate(db, LOGS_DB_MIGRATIONS_PATH);
  provide(InjectionToken.LogsDatabase, db);
  process.on('sveltekit:shutdown', () => db.close());

  initAddActionStatement();
};
