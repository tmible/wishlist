import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from 'wishlist-bot/helpers/resolve-module';

describe('persistent session', () => {
  let ClassicLevel;
  let db;
  let getSessionKey;
  let initPersistentSession;
  let dropPersistentSession;
  let destroyPersistentSession;

  const sessionKey = 'sessionKey';

  beforeEach(async () => {
    [ { ClassicLevel }, getSessionKey ] = await Promise.all([
      td.replaceEsm('classic-level'),
      (async () =>
        (await td.replaceEsm(await resolveModule('wishlist-bot/helpers/get-session-key'))).default
      )(),
    ]);

    db = td.object([ 'get', 'put', 'close' ]);
    td.when(getSessionKey(), { ignoreExtraArgs: true }).thenReturn(sessionKey);

    ({
      initPersistentSession,
      dropPersistentSession,
      destroyPersistentSession,
    } = await import('../index.js'));
  });

  afterEach(() => td.reset());

  describe('on init', () => {
    it('should open DB connection', () => {
      process.env.PERSISTENT_SESSION_PATH = 'PERSISTENT_SESSION_PATH';
      initPersistentSession();
      td.verify(new ClassicLevel('PERSISTENT_SESSION_PATH', { valueEncoding: 'json' }));
    });

    describe('session middleware', () => {
      let middleware;
      let ctx;
      let next;

      beforeEach(() => {
        td.when(new ClassicLevel(), { ignoreExtraArgs: true }).thenReturn(db);
        middleware = initPersistentSession();
        ctx = { session: {} };
        next = async () => {};
      });

      it('should get session from DB', async () => {
        await middleware(ctx, next);
        td.verify(db.get(sessionKey));
      });

      it('should set default value on not found error', async () => {
        td.when(db.get(sessionKey), { times: 1 }).thenReject({ code: 'LEVEL_NOT_FOUND' });
        await middleware(ctx, next);
        td.verify(dropPersistentSession());
      });

      it('should get default value on not found error', async () => {
        td.when(db.get(sessionKey), { times: 1 }).thenReject({ code: 'LEVEL_NOT_FOUND' });
        await middleware(ctx, next);
        td.verify(db.get(sessionKey), { times: 2 });
      });

      it('should throw other errors', async () => {
        td.when(db.get(sessionKey)).thenReject(new Error('other error'));
        await assert.rejects(async () => middleware(ctx, next), new Error('other error'));
      });

      it('should define \'persistent\' property', async () => {
        await middleware(ctx, async () => {
          assert(Object.hasOwn(ctx.session, 'persistent'));
        });
      });

      it('should provide access to value from DB via \'persistent\' property', async () => {
        td.when(db.get(sessionKey)).thenResolve({ key: 'value' });
        await middleware(ctx, async () => {
          assert.deepEqual(ctx.session.persistent, { key: 'value' });
        });
      });

      it('should put session to DB if touched after next()', async () => {
        td.when(db.get(sessionKey)).thenResolve({});
        await middleware(ctx, async () => ctx.session.persistent = { key: 'value' });
        td.verify(db.put(sessionKey, { key: 'value' }));
      });

      it('should not put session to DB if not touched after next()', async () => {
        await middleware(ctx, next);
        td.verify(db.put(), { times: 0, ignoreExtraArgs: true });
      });

      it('should put session to DB if touched after next() error', async () => {
        td.when(db.get(sessionKey)).thenResolve({});
        try {
          await middleware(ctx, async () => {
            ctx.session.persistent.key = 'value';
            throw new Error();
          });
        } catch {} finally {
          td.verify(db.put(sessionKey, { key: 'value' }));
        }
      });

      it('should not put session to DB if not touched after next() error', async () => {
        try {
          await middleware(ctx, async () => { throw new Error(); });
        } catch {} finally {
          td.verify(db.put(), { times: 0, ignoreExtraArgs: true });
        }
      });
    });
  });

  describe('on drop', () => {
    it('should set default value to DB', async () => {
      td.when(new ClassicLevel(), { ignoreExtraArgs: true }).thenReturn(db);
      initPersistentSession();
      await dropPersistentSession();
      td.verify(db.put(sessionKey, { lists: {} }));
    });
  });

  describe('on destroy', () => {
    it('should close DB connection', async () => {
      td.when(new ClassicLevel(), { ignoreExtraArgs: true }).thenReturn(db);
      initPersistentSession();
      await destroyPersistentSession();
      td.verify(db.close());
    });
  });
});
