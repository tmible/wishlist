import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const db = object([ 'prepare', 'close' ]);
const statement = object([ 'run' ]);

const [ Database, build, migrate ] = await Promise.all([
  replaceEsm('better-sqlite3').then((module) => module.default),
  replaceEsm('pino-abstract-transport').then((module) => module.default),
  replaceModule('@tmible/wishlist-bot/helpers/db-migrations'),
]);

const transport = await import('../pino-sqlite-transport.worker.js')
  .then((module) => module.default);

describe('pino sqlite transport worker', () => {
  beforeEach(() => {
    process.env.LOGS_DB_FILE_PATH = 'logs db file path';
    process.env.LOGS_DB_MIGRATIONS_PATH = 'logs db migrations path';
  });

  afterEach(reset);

  it('should open DB connection', async () => {
    await transport();
    verify(new Database('logs db file path'));
  });

  describe('with DB', () => {
    beforeEach(() => {
      when(new Database('logs db file path')).thenReturn(db);
    });

    afterEach(reset);

    it('should migrate DB', async () => {
      await transport();
      verify(migrate(db, 'logs db migrations path'));
    });

    it('should prepare statement', async () => {
      await transport();
      verify(db.prepare(matchers.isA(String)));
    });

    it('should build transport', async () => {
      await transport();
      verify(build(matchers.isA(Function), matchers.contains({ close: matchers.isA(Function) })));
    });

    it('should run statement for every message', async () => {
      when(db.prepare(matchers.isA(String))).thenReturn(statement);
      const captor = matchers.captor();
      await transport();
      verify(build(captor.capture(), matchers.contains({ close: matchers.isA(Function) })));
      const source = {
        [Symbol.asyncIterator]: () => ({
          nextCalls: 0,
          next() {
            return this.nextCalls++ === 0 ?
              { done: false, value: { message: 'message' } } :
              { done: true };
          },
        }),
      };
      await captor.value(source);
      verify(statement.run({
        updateType: null,
        updatePayload: null,
        message: 'message',
      }));
    });

    it('should close DB connection', async () => {
      const captor = matchers.captor();
      await transport();
      verify(build(matchers.isA(Function), captor.capture()));
      await captor.value.close();
      verify(db.close());
    });
  });
});
