import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { WISHLIST_DB_FILE_PATH, WISHLIST_DB_MIGRATIONS_PATH } from '$env/static/private';
import { InjectionToken } from '$lib/architecture/injection-token';
import { initAddCategoryStatement } from './add-category-statement.js';
import { initAddItemStatement } from './add-item-statement.js';
import { initAddUserStatement } from './add-user-statement.js';
import { initChangesStatement } from './changes-statement.js';
import { initDeleteCategoryStatement } from './delete-category-statement.js';
import { initDeleteRefreshTokenStatement } from './delete-refresh-token-statement.js';
import { initGetRefreshTokenStatement } from './get-refresh-token-statement.js';
import { initGetUserCategoriesStatement } from './get-user-categories-statement.js';
import { initGetUserHashStatement } from './get-user-hash-statement.js';
import { initGetUserWishlistStatement } from './get-user-wishlist-statement.js';
import { initSetUserHashStatement } from './set-user-hash-statement.js';
import { initStoreRefreshTokenStatement } from './store-refresh-token-statement.js';
import { initUpdateCategoryStatement } from './update-category-statement.js';

/**
 * Создание подключения к БД с отложенным закрытием, миграции БД, регистрация БД в сервисе
 * внедрения зависмостей, инициализация всех подготовленных SQL выражений
 * @function initDB
 * @returns {Promise<void>}
 * @async
 */
// eslint-disable-next-line max-statements -- Объявления выражений, не масштабируется
export const initDB = async () => {
  const db = new Database(WISHLIST_DB_FILE_PATH);
  await migrate(db, WISHLIST_DB_MIGRATIONS_PATH);
  provide(InjectionToken.Database, db);
  process.on('sveltekit:shutdown', () => db.close());

  initAddUserStatement();
  initGetUserWishlistStatement();
  initAddItemStatement();
  initGetUserCategoriesStatement();
  initAddCategoryStatement();
  initChangesStatement();
  initUpdateCategoryStatement();
  initDeleteCategoryStatement();
  initGetUserHashStatement();
  initSetUserHashStatement();
  initStoreRefreshTokenStatement();
  initGetRefreshTokenStatement();
  initDeleteRefreshTokenStatement();
};
