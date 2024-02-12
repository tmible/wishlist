import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('local DB service', () => {
  let ClassicLevel;
  let db;
  let getLocalDB;
  let closeLocalDB;

  beforeEach(async () => {
    ({ ClassicLevel } = await td.replaceEsm('classic-level'));
    db = td.object([ 'get', 'put', 'close', 'sublevel' ]);
    ({ getLocalDB, closeLocalDB } = await import('../local-db.service.js'));
  });

  afterEach(() => td.reset());

  describe('getLocalDB', () => {
    beforeEach(() => {
      process.env.LOCAL_DB_PATH = 'LOCAL_DB_PATH';
    });

    it('should init DB', () => {
      getLocalDB();
      td.verify(new ClassicLevel('LOCAL_DB_PATH', { valueEncoding: 'json' }));
    });

    it('should init DB only once', () => {
      getLocalDB();
      getLocalDB();
      td.verify(new ClassicLevel('LOCAL_DB_PATH', { valueEncoding: 'json' }), { times: 1 });
    });

    it('should return DB', () => {
      td.when(new ClassicLevel(), { ignoreExtraArgs: true }).thenReturn(db);
      assert.deepEqual(getLocalDB(), db);
    });

    it('should return DB part', () => {
      td.when(new ClassicLevel(), { ignoreExtraArgs: true }).thenReturn(db);
      td.when(
        db.sublevel(td.matchers.isA(String), { valueEncoding: 'json' }),
      ).thenReturn(
        'sublevel',
      );
      assert.equal(getLocalDB('sublevel-name'), 'sublevel');
    });
  });

  describe('closeLocalDB', () => {
    it('should close DB connection', async () => {
      td.when(new ClassicLevel(), { ignoreExtraArgs: true }).thenReturn(db);
      getLocalDB();
      await closeLocalDB();
      td.verify(db.close());
    });
  });
});
