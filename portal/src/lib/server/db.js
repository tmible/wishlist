import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { WISHLIST_DB_FILE_PATH, WISHLIST_DB_MIGRATIONS_PATH } from '$env/static/private';
import { InjectionToken } from '$lib/architecture/injection-token';
import { initAddItemStatement } from './add-item-statement.js';
import { initAddUserStatement } from './add-user-statement.js';
import { initGetUserWishlistStatement } from './get-user-wishlist-statement.js';

/**
 * Создание подключения к БД с отложенным закрытием, миграции БД, регистрация БД в сервисе
 * внедрения зависмостей, инициализация всех подготовленных SQL выражений
 * @function initDB
 * @returns {Promise<void>}
 * @async
 */
export const initDB = async () => {
  const db = new Database(WISHLIST_DB_FILE_PATH);
  await migrate(db, WISHLIST_DB_MIGRATIONS_PATH);
  provide(InjectionToken.Database, db);
  process.on('sveltekit:shutdown', () => db.close());

  initAddUserStatement();
  initGetUserWishlistStatement();
  initAddItemStatement();
};
