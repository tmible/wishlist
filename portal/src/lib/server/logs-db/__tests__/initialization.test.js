import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initDB } from '../initialization.js';
import { Database as DatabaseInjectionToken } from '../injection-tokens.js';

vi.mock('@tmible/wishlist-common/db-migrations');
vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('better-sqlite3');
vi.mock(
  '$env/static/private',
  () => ({
    LOGS_DB_FILE_PATH: 'LOGS_DB_FILE_PATH',
    LOGS_DB_MIGRATIONS_PATH: 'LOGS_DB_MIGRATIONS_PATH',
  }),
);
vi.mock('../injection-tokens.js', () => ({ Database: 'database' }));

describe('logs DB / initialization', () => {
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
    expect(vi.mocked(Database)).toHaveBeenCalledWith('LOGS_DB_FILE_PATH');
  });

  it('should migrate database', () => {
    initDB();
    expect(vi.mocked(migrate)).toHaveBeenCalledWith(db, 'LOGS_DB_MIGRATIONS_PATH');
  });

  it('should provide database', () => {
    initDB();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(DatabaseInjectionToken, db);
  });

  it('should set close listener', () => {
    vi.spyOn(process, 'on');
    initDB();
    expect(process.on).toHaveBeenCalledWith('sveltekit:shutdown', expect.any(Function));
  });

  it('should close db on close listener invocation', () => {
    let handler;
    vi.spyOn(process, 'on').mockImplementationOnce(
      (eventName, eventHandler) => handler = eventHandler,
    );
    initDB();
    handler();
    expect(db.close).toHaveBeenCalled();
  });
});
