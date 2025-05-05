import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

describe('DB migrations', () => {
  let migrate;
  let db;

  beforeEach(async () => {
    mock.module(
      'node:fs',
      {
        cache: true,
        namedExports: {
          readdirSync: mock.fn(() => [ 'migration' ]),
          readFileSync: mock.fn(() => 'sql script'),
        },
      },
    );
    migrate = await import('../db-migrations.js').then((module) => module.default);
    db = {
      pragma: mock.fn(() => 0),
      transaction: mock.fn((transaction) => (...args) => transaction(...args)),
      exec: mock.fn(),
    };
  });

  afterEach(() => {
    mock.reset();
  });

  it('should migrate DB', () => {
    migrate(db, 'DB_MIGRATIONS_PATH');
    assert.deepEqual(db.exec.mock.calls[0].arguments, [ 'sql script' ]);
  });

  it('should update DB user_version', () => {
    migrate(db, 'DB_MIGRATIONS_PATH');
    assert.deepEqual(db.pragma.mock.calls[1].arguments, [ 'user_version = 1' ]);
  });
});
