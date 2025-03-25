import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { initAddCategoryStatement } from '../add-category-statement.js';
import { initAddItemStatement } from '../add-item-statement.js';
import { initAddUserStatement } from '../add-user-statement.js';
import { initChangesStatement } from '../changes-statement.js';
import { initDB } from '../db.js';
import { initDeleteCategoryStatement } from '../delete-category-statement.js';
import { initDeleteRefreshTokenStatement } from '../delete-refresh-token-statement.js';
import { initGetRefreshTokenStatement } from '../get-refresh-token-statement.js';
import { initGetUserCategoriesStatement } from '../get-user-categories-statement.js';
import { initGetUserHashStatement } from '../get-user-hash-statement.js';
import { initGetUserWishlistStatement } from '../get-user-wishlist-statement.js';
import { initSetUserHashStatement } from '../set-user-hash-statement.js';
import { initStoreRefreshTokenStatement } from '../store-refresh-token-statement.js';
import { initUpdateCategoryStatement } from '../update-category-statement.js';

vi.mock('@tmible/wishlist-common/db-migrations');
vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('better-sqlite3');
vi.mock(
  '$env/static/private',
  () => ({
    WISHLIST_DB_FILE_PATH: 'WISHLIST_DB_FILE_PATH',
    WISHLIST_DB_MIGRATIONS_PATH: 'WISHLIST_DB_MIGRATIONS_PATH',
  }),
);
vi.mock('../add-category-statement.js');
vi.mock('../add-item-statement.js');
vi.mock('../add-user-statement.js');
vi.mock('../changes-statement.js');
vi.mock('../delete-category-statement.js');
vi.mock('../delete-refresh-token-statement.js');
vi.mock('../get-refresh-token-statement.js');
vi.mock('../get-user-categories-statement.js');
vi.mock('../get-user-hash-statement.js');
vi.mock('../get-user-wishlist-statement.js');
vi.mock('../set-user-hash-statement.js');
vi.mock('../store-refresh-token-statement.js');
vi.mock('../update-category-statement.js');

describe('db', () => {
  let db;

  beforeEach(() => {
    db = { close: vi.fn() };
    vi.mocked(Database).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create database', () => {
    initDB();
    expect(vi.mocked(Database)).toHaveBeenCalledWith('WISHLIST_DB_FILE_PATH');
  });

  it('should migrate database', () => {
    initDB();
    expect(vi.mocked(migrate)).toHaveBeenCalledWith(db, 'WISHLIST_DB_MIGRATIONS_PATH');
  });

  it('should provide database', () => {
    initDB();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(InjectionToken.Database, db);
  });

  it('should set close listener', () => {
    vi.spyOn(process, 'on');
    initDB();
    expect(process.on).toHaveBeenCalledWith('sveltekit:shutdown', expect.any(Function));
  });

  it('should close db on close listener invocation', () => {
    let handler;
    vi.spyOn(process, 'on').mockImplementation((eventName, eventHandler) => handler = eventHandler);
    initDB();
    handler();
    expect(db.close).toHaveBeenCalled();
  });

  it('should init add user statement', () => {
    initDB();
    expect(vi.mocked(initAddUserStatement)).toHaveBeenCalled();
  });

  it('should init get user wishlist statement', () => {
    initDB();
    expect(vi.mocked(initGetUserWishlistStatement)).toHaveBeenCalled();
  });

  it('should init add item statement', () => {
    initDB();
    expect(vi.mocked(initAddItemStatement)).toHaveBeenCalled();
  });

  it('should init get user categories statement', () => {
    initDB();
    expect(vi.mocked(initGetUserCategoriesStatement)).toHaveBeenCalled();
  });

  it('should init add category statement', () => {
    initDB();
    expect(vi.mocked(initAddCategoryStatement)).toHaveBeenCalled();
  });

  it('should init changes statement', () => {
    initDB();
    expect(vi.mocked(initChangesStatement)).toHaveBeenCalled();
  });

  it('should init update category statement', () => {
    initDB();
    expect(vi.mocked(initUpdateCategoryStatement)).toHaveBeenCalled();
  });

  it('should init delete category statement', () => {
    initDB();
    expect(vi.mocked(initDeleteCategoryStatement)).toHaveBeenCalled();
  });

  it('should init get user hash statement', () => {
    initDB();
    expect(vi.mocked(initGetUserHashStatement)).toHaveBeenCalled();
  });

  it('should init set user hash statement', () => {
    initDB();
    expect(vi.mocked(initSetUserHashStatement)).toHaveBeenCalled();
  });

  it('should init store refresh token statement', () => {
    initDB();
    expect(vi.mocked(initStoreRefreshTokenStatement)).toHaveBeenCalled();
  });

  it('should init get refresh token statement', () => {
    initDB();
    expect(vi.mocked(initGetRefreshTokenStatement)).toHaveBeenCalled();
  });

  it('should init delete refresh token statement', () => {
    initDB();
    expect(vi.mocked(initDeleteRefreshTokenStatement)).toHaveBeenCalled();
  });
});
