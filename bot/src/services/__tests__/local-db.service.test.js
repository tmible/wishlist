import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';

describe('local DB service', () => {
  let ClassicLevel;
  let db;
  let getLocalDB;
  let closeLocalDB;

  beforeEach(async () => {
    ({ ClassicLevel } = await replaceEsm('classic-level'));
    db = object([ 'get', 'put', 'close', 'sublevel' ]);
    ({ getLocalDB, closeLocalDB } = await import('../local-db.service.js'));
  });

  afterEach(reset);

  describe('getLocalDB', () => {
    beforeEach(() => {
      process.env.LOCAL_DB_PATH = 'LOCAL_DB_PATH';
    });

    it('should init DB', () => {
      getLocalDB();
      verify(new ClassicLevel('LOCAL_DB_PATH', { valueEncoding: 'json' }));
    });

    it('should init DB only once', () => {
      getLocalDB();
      getLocalDB();
      verify(new ClassicLevel('LOCAL_DB_PATH', { valueEncoding: 'json' }), { times: 1 });
    });

    it('should return DB', () => {
      when(new ClassicLevel(), { ignoreExtraArgs: true }).thenReturn(db);
      assert.deepEqual(getLocalDB(), db);
    });

    it('should return DB part', () => {
      when(new ClassicLevel(), { ignoreExtraArgs: true }).thenReturn(db);
      when(
        db.sublevel(matchers.isA(String), { valueEncoding: 'json' }),
      ).thenReturn(
        'sublevel',
      );
      assert.equal(getLocalDB('sublevel-name'), 'sublevel');
    });
  });

  describe('closeLocalDB', () => {
    it('should close DB connection', async () => {
      when(new ClassicLevel(), { ignoreExtraArgs: true }).thenReturn(db);
      getLocalDB();
      await closeLocalDB();
      verify(db.close());
    });
  });
});
