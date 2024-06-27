import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';

const db = object([ 'prepare', 'close' ]);
const statement = object([ 'run' ]);

const [ Database, build ] = await Promise.all([
  replaceEsm('better-sqlite3').then((module) => module.default),
  replaceEsm('pino-abstract-transport').then((module) => module.default),
]);

const transport = await import('../pino-sqlite-transport.worker.js')
  .then((module) => module.default);

describe('pino sqlite transport worker', () => {
  beforeEach(() => {
    process.env.LOGS_DB_FILE_PATH = 'logs db file path';
  });

  afterEach(reset);

  it('should open DB connection', () => {
    transport();
    verify(new Database('logs db file path'));
  });

  describe('with DB', () => {
    beforeEach(() => {
      when(new Database('logs db file path')).thenReturn(db);
    });

    afterEach(reset);

    it('should prepare statement', () => {
      transport();
      verify(db.prepare(matchers.isA(String)));
    });

    it('should build transport', () => {
      transport();
      verify(build(matchers.isA(Function), matchers.contains({ close: matchers.isA(Function) })));
    });

    it('should run statement for every message', async () => {
      when(db.prepare(matchers.isA(String))).thenReturn(statement);
      const captor = matchers.captor();
      transport();
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
      transport();
      verify(build(matchers.isA(Function), captor.capture()));
      await captor.value.close();
      verify(db.close());
    });
  });
});
