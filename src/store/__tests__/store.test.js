import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';

const modules = new Array(3).fill(null).map(() => object([ 'configure' ]));

/* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
  Пробелы для консистентности с другими элементами массива
*/
const [ Database, { readdir, readFile } ] = await Promise.all([
  replaceEsm('better-sqlite3').then((module) => module.default),
  replaceEsm('node:fs/promises'),
  replaceEsm('../wishlist/index.js', {}, modules[0]),
  replaceEsm('../editing/index.js', {}, modules[1]),
  replaceEsm('../usernames/index.js', {}, modules[2]),
]);

const initStore = await import('../index.js').then((module) => module.default);

describe('store', () => {
  beforeEach(() => {
    process.env.WISHLIST_DB_FILE_PATH = 'WISHLIST_DB_FILE_PATH';
    process.env.WISHLIST_DB_MIGRATIONS_PATH = 'WISHLIST_DB_MIGRATIONS_PATH';
  });

  afterEach(reset);

  it('should open DB connection', async () => {
    when(readdir('WISHLIST_DB_MIGRATIONS_PATH')).thenResolve([]);
    await initStore();
    verify(new Database('WISHLIST_DB_FILE_PATH'));
  });

  it('should migrate DB', async () => {
    when(Database.prototype.pragma('user_version', { simple: true })).thenReturn(0);
    when(
      Database.prototype.transaction(matchers.isA(Function)),
    ).thenDo(
      (transaction) => (...args) => transaction(...args),
    );
    when(readdir('WISHLIST_DB_MIGRATIONS_PATH')).thenResolve([ 'migration' ]);
    when(
      readFile(matchers.isA(String)),
      { ignoreExtraArgs: true },
    ).thenResolve(
      'sql script',
    );

    await initStore();

    verify(Database.prototype.exec('sql script'));
  });

  it('should update DB user_version', async () => {
    when(Database.prototype.pragma('user_version', { simple: true })).thenReturn(0);
    when(
      Database.prototype.transaction(matchers.isA(Function)),
    ).thenDo(
      (transaction) => (...args) => transaction(...args),
    );
    when(readdir('WISHLIST_DB_MIGRATIONS_PATH')).thenResolve([ 'migration' ]);
    when(
      readFile(matchers.isA(String)),
      { ignoreExtraArgs: true },
    ).thenResolve(
      'sql script',
    );

    await initStore();

    verify(Database.prototype.pragma('user_version = 1'));
  });

  it('should configure modules', async () => {
    when(readdir('WISHLIST_DB_MIGRATIONS_PATH')).thenResolve([]);
    await initStore();
    verify(modules.forEach(({ configure }) => configure()));
  });

  it('should close DB connection', async () => {
    when(readdir('WISHLIST_DB_MIGRATIONS_PATH')).thenResolve([]);
    await initStore().then((destroyStore) => destroyStore());
    verify(Database.prototype.close());
  });
});
