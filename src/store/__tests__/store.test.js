import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';

describe('store', () => {
  let Database;
  let readdir;
  let readFile;
  let modules;
  let initStore;
  let destroyStore;

  beforeEach(async () => {
    modules = new Array(3).fill(null).map(() => td.object([ 'configure' ]));

    [ Database, { readdir, readFile } ] = await Promise.all([
      (async () => (await td.replaceEsm('better-sqlite3')).default)(),
      td.replaceEsm('node:fs/promises'),
      td.replaceEsm('../wishlist/index.js', {}, modules[0]),
      td.replaceEsm('../editing/index.js', {}, modules[1]),
      td.replaceEsm('../usernames/index.js', {}, modules[2]),
    ]);

    ({ initStore, destroyStore } = await import('../index.js'));

    process.env.WISHLIST_DB_FILE_PATH = 'WISHLIST_DB_FILE_PATH';
    process.env.WISHLIST_DB_MIGRATIONS_PATH = 'WISHLIST_DB_MIGRATIONS_PATH';
  });

  afterEach(() => td.reset());

  describe('on init', () => {
    it('should open DB connection', async () => {
      td.when(readdir('WISHLIST_DB_MIGRATIONS_PATH')).thenResolve([]);

      await initStore();

      td.verify(new Database('WISHLIST_DB_FILE_PATH'));
    });

    it('should migrate DB', async () => {
      td.when(Database.prototype.pragma('user_version', { simple: true })).thenReturn(0);
      td.when(
        Database.prototype.transaction(td.matchers.isA(Function)),
      ).thenDo(
        (transaction) => async (...args) => transaction(...args),
      );
      td.when(readdir('WISHLIST_DB_MIGRATIONS_PATH')).thenResolve(new Array(1).fill('migration'));
      td.when(
        readFile(td.matchers.isA(String)),
        { ignoreExtraArgs: true },
      ).thenResolve(
        'sql script',
      );

      await initStore();

      td.verify(Database.prototype.exec('sql script'));
    });

    it('should update DB user_version', async () => {
      td.when(Database.prototype.pragma('user_version', { simple: true })).thenReturn(0);
      td.when(
        Database.prototype.transaction(td.matchers.isA(Function)),
      ).thenDo(
        (transaction) => async (...args) => transaction(...args),
      );
      td.when(readdir('WISHLIST_DB_MIGRATIONS_PATH')).thenResolve(new Array(1).fill('migration'));
      td.when(
        readFile(td.matchers.isA(String)),
        { ignoreExtraArgs: true },
      ).thenResolve(
        'sql script',
      );

      await initStore();

      td.verify(Database.prototype.pragma('user_version = 1'));
    });

    it('should configure modules', async () => {
      td.when(readdir('WISHLIST_DB_MIGRATIONS_PATH')).thenResolve([]);

      await initStore();

      td.verify(modules.forEach(({ configure }) => configure()));
    });
  });

  describe('on destroy', () => {
    it('should close DB connection', async () => {
      td.when(readdir('WISHLIST_DB_MIGRATIONS_PATH')).thenResolve([]);

      await initStore();
      await destroyStore();

      td.verify(Database.prototype.close());
    });
  });
});
