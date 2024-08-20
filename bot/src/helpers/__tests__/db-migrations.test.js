import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';

const { readdir, readFile } = await replaceEsm('node:fs/promises');

const migrate = await import('../db-migrations.js').then((module) => module.default);

describe('DB migrations', () => {
  let db;

  beforeEach(() => {
    db = object([ 'pragma', 'transaction', 'exec' ]);
    when(db.pragma('user_version', { simple: true })).thenReturn(0);
    when(
      db.transaction(matchers.isA(Function)),
    ).thenDo(
      (transaction) => (...args) => transaction(...args),
    );
    when(readdir('DB_MIGRATIONS_PATH')).thenResolve([ 'migration' ]);
    when(
      readFile(matchers.isA(String)),
      { ignoreExtraArgs: true },
    ).thenResolve(
      'sql script',
    );
  });

  afterEach(reset);

  it('should migrate DB', async () => {
    await migrate(db, 'DB_MIGRATIONS_PATH');
    verify(db.exec('sql script'));
  });

  it('should update DB user_version', async () => {
    await migrate(db, 'DB_MIGRATIONS_PATH');
    verify(db.pragma('user_version = 1'));
  });
});
