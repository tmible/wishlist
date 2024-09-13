import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { initDAUStatement } from '../dau-statement.js';
import { initDB } from '../db.js';
import { initMAUStatement } from '../mau-statement.js';
import { initProcessTimeStatement } from '../process-time-statement.js';
import { initResponseTimeStatement } from '../response-time-statement.js';
import { initStartupTimeStatement } from '../startup-time-statement.js';
import { initSuccessRateStatement } from '../success-rate-statement.js';
import { initUserSessionsStatement } from '../user-sessions-statement.js';
import { initYAUStatement } from '../yau-statement.js';

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
vi.mock('../dau-statement.js');
vi.mock('../mau-statement.js');
vi.mock('../process-time-statement.js');
vi.mock('../response-time-statement.js');
vi.mock('../startup-time-statement.js');
vi.mock('../success-rate-statement.js');
vi.mock('../user-sessions-statement.js');
vi.mock('../yau-statement.js');

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
    expect(vi.mocked(Database)).toHaveBeenCalledWith('LOGS_DB_FILE_PATH');
  });

  it('should migrate database', async () => {
    await initDB();
    expect(vi.mocked(migrate)).toHaveBeenCalledWith(db, 'LOGS_DB_MIGRATIONS_PATH');
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

  it('should init DAU statement', async () => {
    await initDB();
    expect(vi.mocked(initDAUStatement)).toHaveBeenCalled();
  });

  it('should init MAU statement', async () => {
    await initDB();
    expect(vi.mocked(initMAUStatement)).toHaveBeenCalled();
  });

  it('should init process time statement', async () => {
    await initDB();
    expect(vi.mocked(initProcessTimeStatement)).toHaveBeenCalled();
  });

  it('should init response time statement', async () => {
    await initDB();
    expect(vi.mocked(initResponseTimeStatement)).toHaveBeenCalled();
  });

  it('should init startup time statement', async () => {
    await initDB();
    expect(vi.mocked(initStartupTimeStatement)).toHaveBeenCalled();
  });

  it('should init success rate statement', async () => {
    await initDB();
    expect(vi.mocked(initSuccessRateStatement)).toHaveBeenCalled();
  });

  it('should init user sessions statement', async () => {
    await initDB();
    expect(vi.mocked(initUserSessionsStatement)).toHaveBeenCalled();
  });

  it('should init YAU statement', async () => {
    await initDB();
    expect(vi.mocked(initYAUStatement)).toHaveBeenCalled();
  });
});
