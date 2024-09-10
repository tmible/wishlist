import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { initAddItemStatement } from '../add-item-statement.js';
import { initAddUserStatement } from '../add-user-statement.js';
import { initDB } from '../db.js';
import { initGetUserWishlistStatement } from '../get-user-wishlist-statement.js';

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
vi.mock('../add-item-statement.js');
vi.mock('../add-user-statement.js');
vi.mock('../get-user-wishlist-statement.js');

describe('db', () => {
  let db;

  beforeEach(() => {
    db = { close: vi.fn() };
    vi.mocked(Database).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create database', async () => {
    await initDB();
    expect(vi.mocked(Database)).toHaveBeenCalledWith('WISHLIST_DB_FILE_PATH');
  });

  it('should migrate database', async () => {
    await initDB();
    expect(vi.mocked(migrate)).toHaveBeenCalledWith(db, 'WISHLIST_DB_MIGRATIONS_PATH');
  });

  it('should provide database', async () => {
    await initDB();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(InjectionToken.Database, db);
  });

  it('should set close listener', async () => {
    vi.spyOn(process, 'on');
    await initDB();
    expect(process.on).toHaveBeenCalledWith('sveltekit:shutdown', expect.any(Function));
  });

  it('should close db on close listener invocation', async () => {
    let handler;
    vi.spyOn(process, 'on').mockImplementation((eventName, eventHandler) => handler = eventHandler);
    await initDB();
    handler();
    expect(db.close).toHaveBeenCalled();
  });

  it('should init add user statement', async () => {
    await initDB();
    expect(vi.mocked(initAddUserStatement)).toHaveBeenCalled();
  });

  it('should init get user wishlist statement', async () => {
    await initDB();
    expect(vi.mocked(initGetUserWishlistStatement)).toHaveBeenCalled();
  });

  it('should init add item statement', async () => {
    await initDB();
    expect(vi.mocked(initAddItemStatement)).toHaveBeenCalled();
  });
});
