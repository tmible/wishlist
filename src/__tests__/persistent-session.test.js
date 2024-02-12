import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('persistent session', () => {
  let db;
  let getSessionKey;
  let getLocalDB;
  let initPersistentSession;
  let dropPersistentSession;
  let destroyPersistentSession;

  const sessionKey = 'sessionKey';

  beforeEach(async () => {
    [ getSessionKey, { getLocalDB } ] = await Promise.all([
      (async () =>
        (await td.replaceEsm(await resolveModule(
          '@tmible/wishlist-bot/helpers/get-session-key',
        ))).default
      )(),
      td.replaceEsm(await resolveModule('@tmible/wishlist-bot/services/local-db')),
    ]);

    db = td.object([ 'get', 'put' ]);
    td.when(getSessionKey(), { ignoreExtraArgs: true }).thenReturn(sessionKey);

    ({
      initPersistentSession,
      dropPersistentSession,
      destroyPersistentSession,
    } = await import('../persistent-session.js'));
  });

  afterEach(() => td.reset());

  describe('on init', () => {
    it('should get DB', () => {
      initPersistentSession();
      td.verify(getLocalDB('persistent-session'));
    });

    describe('session middleware', () => {
      let middleware;
      let ctx;
      let next;

      beforeEach(() => {
        td.when(getLocalDB(), { ignoreExtraArgs: true }).thenReturn(db);
        middleware = initPersistentSession();
        ctx = { session: {} };
        next = async () => {};
      });

      it('should get session from DB', async () => {
        await middleware(ctx, next);
        td.verify(db.get(sessionKey));
      });

      describe('on not found error', () => {
        let ctx;

        beforeEach(async () => {
          ctx = { session: {} };
          td.when(db.get(sessionKey), { times: 1 }).thenReject({ code: 'LEVEL_NOT_FOUND' });
          await middleware(ctx, next);
        });

        it('should set default value', () => {
          td.verify(dropPersistentSession(ctx));
        });

        it('should get default value', () => {
          td.verify(db.get(sessionKey), { times: 2 });
        });
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
    let ctx;

    beforeEach(() => {
      td.when(getLocalDB(), { ignoreExtraArgs: true }).thenReturn(db);
      initPersistentSession();
      ctx = { session: { persistent: 'persistent' } };
    });

    it('should set default value to context if persistent session is not defined', async () => {
      ctx = { session: {} };
      await dropPersistentSession(ctx);
      assert.deepEqual(ctx.session, {});
    });

    it('should set default value to context if persistent session is defined', async () => {
      await dropPersistentSession(ctx);
      assert.deepEqual(ctx.session.persistent, { lists: {} });
    });

    it('should set default value to DB', async () => {
      await dropPersistentSession(ctx);
      td.verify(db.put(sessionKey, { lists: {} }));
    });
  });
});
