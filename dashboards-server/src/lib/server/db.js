import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { LOGS_DB_FILE_PATH, LOGS_DB_MIGRATIONS_PATH } from '$env/static/private';
import { InjectionToken } from '$lib/architecture/injection-token';
import {
  initBotDAUStatement,
  initBotMAUStatement,
  initBotProcessTimeStatement,
  initBotResponseTimeStatement,
  initBotStartupTimeStatement,
  initBotSuccessRateStatement,
  initBotUserSessionsStatement,
  initBotYAUStatement,
} from './bot-statements';
import {
  initPortalAuthenticationFunnelStatement,
  initPortalDAUStatement,
  initPortalMAUStatement,
  initPortalResponseTimeStatement,
  initPortalSuccessRateStatement,
  initPortalYAUStatement,
} from './portal-statements';

/**
 * Создание подключения к БД с отложенным закрытием, миграции БД, регистрация БД в сервисе
 * внедрения зависмостей, инициализация всех подготовленных SQL выражений
 * @function initDB
 * @returns {void}
 */
/* eslint-disable-next-line max-statements -- Рунная инициализация SQL выражений */
export const initDB = () => {
  const db = new Database(LOGS_DB_FILE_PATH);
  migrate(db, LOGS_DB_MIGRATIONS_PATH);
  provide(InjectionToken.Database, db);
  process.on('sveltekit:shutdown', () => db.close());

  initBotResponseTimeStatement();
  initBotProcessTimeStatement();
  initBotStartupTimeStatement();
  initBotDAUStatement();
  initBotMAUStatement();
  initBotYAUStatement();
  initBotSuccessRateStatement();
  initBotUserSessionsStatement();

  initPortalResponseTimeStatement();
  initPortalDAUStatement();
  initPortalMAUStatement();
  initPortalYAUStatement();
  initPortalSuccessRateStatement();
  initPortalAuthenticationFunnelStatement();
};
