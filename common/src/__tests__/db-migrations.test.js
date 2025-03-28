import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import migrate from '../db-migrations.js';

vi.mock('node:fs', () => ({
  readdirSync: vi.fn(() => [ 'migration' ]),
  readFileSync: vi.fn(() => 'sql script'),
}));

describe('DB migrations', () => {
  let db;

  beforeEach(() => {
    db = {
      pragma: vi.fn(() => 0),
      transaction: vi.fn((transaction) => (...args) => transaction(...args)),
      exec: vi.fn(),
    };
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should migrate DB', () => {
    migrate(db, 'DB_MIGRATIONS_PATH');
    expect(db.exec).toHaveBeenCalledWith('sql script');
  });

  it('should update DB user_version', () => {
    migrate(db, 'DB_MIGRATIONS_PATH');
    expect(db.pragma).toHaveBeenCalledWith('user_version = 1');
  });
});
