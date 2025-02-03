import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { initAddActionStatement } from '../add-action-statement.js';
import { initLogsDB } from '../logs-db.js';

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
vi.mock('../add-action-statement.js');

describe('logs db', () => {
  let db;

  beforeEach(() => {
    db = { close: vi.fn() };
    vi.mocked(Database).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create database', async () => {
    await initLogsDB();
    expect(vi.mocked(Database)).toHaveBeenCalledWith('LOGS_DB_FILE_PATH');
  });

  it('should migrate database', async () => {
    await initLogsDB();
    expect(vi.mocked(migrate)).toHaveBeenCalledWith(db, 'LOGS_DB_MIGRATIONS_PATH');
  });

  it('should provide database', async () => {
    await initLogsDB();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(InjectionToken.LogsDatabase, db);
  });

  it('should set close listener', async () => {
    vi.spyOn(process, 'on');
    await initLogsDB();
    expect(process.on).toHaveBeenCalledWith('sveltekit:shutdown', expect.any(Function));
  });

  it('should close db on close listener invocation', async () => {
    let handler;
    vi.spyOn(process, 'on').mockImplementation((eventName, eventHandler) => handler = eventHandler);
    await initLogsDB();
    handler();
    expect(db.close).toHaveBeenCalled();
  });

  it('should init add action statement', async () => {
    await initLogsDB();
    expect(vi.mocked(initAddActionStatement)).toHaveBeenCalled();
  });
});
