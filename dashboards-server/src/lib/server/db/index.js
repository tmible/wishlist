import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { LOGS_DB_FILE_PATH, LOGS_DB_MIGRATIONS_PATH } from '$env/static/private';
import {
  initDAUStatement as initBotDAUStatement,
  initMAUStatement as initBotMAUStatement,
  initProcessTimeStatement as initBotProcessTimeStatement,
  initResponseTimeStatement as initBotResponseTimeStatement,
  initStartupTimeStatement as initBotStartupTimeStatement,
  initSuccessRateStatement as initBotSuccessRateStatement,
  initUserSessionsStatement as initBotUserSessionsStatement,
  initYAUStatement as initBotYAUStatement,
} from './bot/statements';
import { Database as DatabaseInjectionToken } from './injection-tokens.js';
import {
  initAuthenticationFunnelStatement as initPortalAuthenticationFunnelStatement,
  initDAUStatement as initPortalDAUStatement,
  initMAUStatement as initPortalMAUStatement,
  initResponseTimeStatement as initPortalResponseTimeStatement,
  initSuccessRateStatement as initPortalSuccessRateStatement,
  initYAUStatement as initPortalYAUStatement,
} from './portal/statements';

/**
 * Создание подключения к БД с отложенным закрытием, миграции БД,
 * регистрация БД в сервисе внедрения зависмостей, создание SQL выражений
 * @function initDB
 * @returns {void}
 */
// eslint-disable-next-line max-statements -- Ручная инициализация выражений
export const initDB = () => {
  const db = new Database(LOGS_DB_FILE_PATH);
  migrate(db, LOGS_DB_MIGRATIONS_PATH);
  provide(DatabaseInjectionToken, db);
  process.on('sveltekit:shutdown', () => db.close());

  initBotResponseTimeStatement();
  initBotProcessTimeStatement();
  initBotStartupTimeStatement();
  initBotDAUStatement();
  initBotMAUStatement();
  initBotYAUStatement();
  initBotUserSessionsStatement();
  initBotSuccessRateStatement();

  initPortalResponseTimeStatement();
  initPortalDAUStatement();
  initPortalMAUStatement();
  initPortalYAUStatement();
  initPortalSuccessRateStatement();
  initPortalAuthenticationFunnelStatement();
};
