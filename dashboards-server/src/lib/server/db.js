import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { LOGS_DB_FILE_PATH, LOGS_DB_MIGRATIONS_PATH } from '$env/static/private';
import { InjectionToken } from '$lib/architecture/injection-token';
import { initDAUStatement } from './dau-statement.js';
import { initMAUStatement } from './mau-statement.js';
import { initProcessTimeStatement } from './process-time-statement.js';
import { initResponseTimeStatement } from './response-time-statement.js';
import { initStartupTimeStatement } from './startup-time-statement.js';
import { initSuccessRateStatement } from './success-rate-statement.js';
import { initUserSessionsStatement } from './user-sessions-statement.js';
import { initYAUStatement } from './yau-statement.js';

/**
 * Создание подключения к БД с отложенным закрытием, миграции БД, регистрация БД в сервисе
 * внедрения зависмостей, инициализация всех подготовленных SQL выражений
 * @function initDB
 * @returns {Promise<void>}
 * @async
 */
/* eslint-disable-next-line max-statements -- Рунная инициализация SQL выражений */
export const initDB = async () => {
  const db = new Database(LOGS_DB_FILE_PATH);
  await migrate(db, LOGS_DB_MIGRATIONS_PATH);
  provide(InjectionToken.Database, db);
  process.on('sveltekit:shutdown', () => db.close());

  initResponseTimeStatement();
  initProcessTimeStatement();
  initStartupTimeStatement();
  initDAUStatement();
  initMAUStatement();
  initYAUStatement();
  initSuccessRateStatement();
  initUserSessionsStatement();
};
