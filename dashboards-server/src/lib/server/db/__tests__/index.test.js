import migrate from '@tmible/wishlist-common/db-migrations';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  initDAUStatement as initBotDAUStatement,
  initMAUStatement as initBotMAUStatement,
  initProcessTimeStatement as initBotProcessTimeStatement,
  initResponseTimeStatement as initBotResponseTimeStatement,
  initStartupTimeStatement as initBotStartupTimeStatement,
  initSuccessRateStatement as initBotSuccessRateStatement,
  initYAUStatement as initBotYAUStatement,
} from '../bot/statements';
import { initDB } from '../index.js';
import { Database as DatabaseInjectionToken } from '../injection-tokens.js';
import {
  initAuthenticationFunnelStatement as initPortalAuthenticationFunnelStatement,
  initDAUStatement as initPortalDAUStatement,
  initMAUStatement as initPortalMAUStatement,
  initResponseTimeStatement as initPortalResponseTimeStatement,
  initSuccessRateStatement as initPortalSuccessRateStatement,
  initYAUStatement as initPortalYAUStatement,
} from '../portal/statements';

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
vi.mock('../bot/statements');
vi.mock('../portal/statements');

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
    vi.spyOn(process, 'on').mockImplementation((eventName, eventHandler) => handler = eventHandler);
    initDB();
    handler();
    expect(db.close).toHaveBeenCalled();
  });

  it('should init bot DAU statement', () => {
    initDB();
    expect(vi.mocked(initBotDAUStatement)).toHaveBeenCalled();
  });

  it('should init bot MAU statement', () => {
    initDB();
    expect(vi.mocked(initBotMAUStatement)).toHaveBeenCalled();
  });

  it('should init bot process time statement', () => {
    initDB();
    expect(vi.mocked(initBotProcessTimeStatement)).toHaveBeenCalled();
  });

  it('should init bot response time statement', () => {
    initDB();
    expect(vi.mocked(initBotResponseTimeStatement)).toHaveBeenCalled();
  });

  it('should init bot startup time statement', () => {
    initDB();
    expect(vi.mocked(initBotStartupTimeStatement)).toHaveBeenCalled();
  });

  it('should init bot success rate statement', () => {
    initDB();
    expect(vi.mocked(initBotSuccessRateStatement)).toHaveBeenCalled();
  });

  it('should init bot YAU statement', () => {
    initDB();
    expect(vi.mocked(initBotYAUStatement)).toHaveBeenCalled();
  });

  it('should init portal authentication funnel statement', () => {
    initDB();
    expect(vi.mocked(initPortalAuthenticationFunnelStatement)).toHaveBeenCalled();
  });

  it('should init portal DAU statement', () => {
    initDB();
    expect(vi.mocked(initPortalDAUStatement)).toHaveBeenCalled();
  });

  it('should init portal MAU statement', () => {
    initDB();
    expect(vi.mocked(initPortalMAUStatement)).toHaveBeenCalled();
  });

  it('should init portal response time statement', () => {
    initDB();
    expect(vi.mocked(initPortalResponseTimeStatement)).toHaveBeenCalled();
  });

  it('should init portal success rate statement', () => {
    initDB();
    expect(vi.mocked(initPortalSuccessRateStatement)).toHaveBeenCalled();
  });

  it('should init portal YAU statement', () => {
    initDB();
    expect(vi.mocked(initPortalYAUStatement)).toHaveBeenCalled();
  });
});
