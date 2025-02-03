import migrate from '@tmible/wishlist-common/db-migrations';
import Database from 'better-sqlite3';
import build from 'pino-abstract-transport';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../pino-sqlite-transport.worker.js';

vi.mock('@tmible/wishlist-common/db-migrations');
vi.mock('better-sqlite3');
vi.mock('pino-abstract-transport');

describe('pino -> sqlite transport worker', () => {
  let db;

  beforeEach(() => {
    db = { prepare: vi.fn(), close: vi.fn() };
    vi.mocked(Database).mockReturnValue(db);
    process.env.LOGS_DB_FILE_PATH = 'LOGS_DB_FILE_PATH';
    process.env.LOGS_DB_MIGRATIONS_PATH = 'LOGS_DB_MIGRATIONS_PATH';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create database', async () => {
    await worker();
    expect(vi.mocked(Database)).toHaveBeenCalledWith('LOGS_DB_FILE_PATH');
  });

  it('should migrate database', async () => {
    await worker();
    expect(vi.mocked(migrate)).toHaveBeenCalledWith(db, 'LOGS_DB_MIGRATIONS_PATH');
  });

  it('should prepare statement', async () => {
    await worker();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should build transport', async () => {
    await worker();
    expect(
      vi.mocked(build),
    ).toHaveBeenCalledWith(
      expect.any(Function),
      { close: expect.any(Function) },
    );
  });

  it('should run statement for every object from source', async () => {
    let transportAction;
    const statement = { run: vi.fn() };
    db.prepare.mockReturnValueOnce(statement);
    vi.mocked(build).mockImplementationOnce((...args) => [ transportAction ] = args);
    await worker();
    await transportAction([{ custom: 'property' }]);
    expect(
      statement.run,
    ).toHaveBeenCalledWith({
      requestUuid: null,
      unknownUserUuid: null,
      userid: null,
      custom: 'property',
    });
  });

  it('should close database', async () => {
    let transportOptions;
    vi.mocked(build).mockImplementationOnce((...args) => [ , transportOptions ] = args);
    await worker();
    await transportOptions.close();
    expect(db.close).toHaveBeenCalled();
  });

  it('should return transport', async () => {
    vi.mocked(build).mockReturnValueOnce('transport');
    await expect(worker()).resolves.toBe('transport');
  });
});
