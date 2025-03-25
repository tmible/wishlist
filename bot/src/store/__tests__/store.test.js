import { afterEach, beforeEach, describe, it } from 'node:test';
import { object, replaceEsm, reset, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const modules = new Array(3).fill(null).map(() => object([ 'configure' ]));

const [ Database, migrate ] = await Promise.all([
  replaceEsm('better-sqlite3').then((module) => module.default),
  replaceModule('@tmible/wishlist-common/db-migrations'),
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

  it('should open DB connection', () => {
    initStore();
    verify(new Database('WISHLIST_DB_FILE_PATH'));
  });

  it('should migrate DB', () => {
    initStore();
    verify(migrate(new Database('WISHLIST_DB_FILE_PATH'), 'WISHLIST_DB_MIGRATIONS_PATH'));
  });

  it('should configure modules', () => {
    initStore();
    verify(modules.forEach(({ configure }) => configure()));
  });

  it('should close DB connection', () => {
    initStore()();
    verify(Database.prototype.close());
  });
});
