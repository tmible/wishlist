import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { object, reset, verify, when } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const sessionKey = 'sessionKey';

/* eslint-disable-next-line @stylistic/js/array-bracket-spacing --
  Пробелы для консистентности с другими элементами массива
*/
const [ getSessionKey, { getLocalDB } ] = await Promise.all([
  replaceModule('@tmible/wishlist-bot/helpers/get-session-key'),
  replaceModule('@tmible/wishlist-bot/services/local-db'),
]);

const { initPersistentSession, dropPersistentSession } = await import('../persistent-session.js');

describe('persistent session', () => {
  let db;

  beforeEach(() => {
    db = object([ 'get', 'put' ]);
    when(getSessionKey(), { ignoreExtraArgs: true }).thenReturn(sessionKey);
  });

  afterEach(reset);

  describe('on init', () => {
    it('should get DB', () => {
      initPersistentSession();
      verify(getLocalDB('persistent-session'));
    });

    describe('session middleware', () => {
      let middleware;
      let ctx;
      let next;

      beforeEach(() => {
        when(getLocalDB(), { ignoreExtraArgs: true }).thenReturn(db);
        middleware = initPersistentSession();
        ctx = { session: {} };
        next = async () => {};
      });

      it('should get session from DB', async () => {
        await middleware(ctx, next);
        verify(db.get(sessionKey));
      });

      describe('on not found error', () => {
        let ctx;

        beforeEach(async () => {
          ctx = { session: {} };
          when(db.get(sessionKey), { times: 1 }).thenReject({ code: 'LEVEL_NOT_FOUND' });
          await middleware(ctx, next);
        });

        it('should set default value', () => {
          verify(dropPersistentSession(ctx));
        });

        it('should get default value', () => {
          verify(db.get(sessionKey), { times: 2 });
        });
      });

      it('should throw other errors', async () => {
        when(db.get(sessionKey)).thenReject(new Error('other error'));
        await assert.rejects(() => middleware(ctx, next), new Error('other error'));
      });

      it('should define \'persistent\' property', async () => {
        await middleware(ctx, () => {
          assert(Object.hasOwn(ctx.session, 'persistent'));
        });
      });

      it('should provide access to value from DB via \'persistent\' property', async () => {
        when(db.get(sessionKey)).thenResolve({ key: 'value' });
        await middleware(ctx, () => {
          assert.deepEqual(ctx.session.persistent, { key: 'value' });
        });
      });

      it('should put session to DB if touched after next()', async () => {
        when(db.get(sessionKey)).thenResolve({});
        await middleware(ctx, () => ctx.session.persistent = { key: 'value' });
        verify(db.put(sessionKey, { key: 'value' }));
      });

      it('should not put session to DB if not touched after next()', async () => {
        await middleware(ctx, next);
        verify(db.put(), { times: 0, ignoreExtraArgs: true });
      });

      it('should put session to DB if touched after next() error', async () => {
        when(db.get(sessionKey)).thenResolve({});
        try {
          await middleware(ctx, () => {
            ctx.session.persistent.key = 'value';
            throw new Error();
          });
        } catch {
          verify(db.put(sessionKey, { key: 'value' }));
        }
      });

      it('should not put session to DB if not touched after next() error', async () => {
        try {
          await middleware(ctx, () => Promise.reject());
        } catch {
          verify(db.put(), { times: 0, ignoreExtraArgs: true });
        }
      });
    });
  });

  describe('on drop', () => {
    let ctx;

    beforeEach(() => {
      when(getLocalDB(), { ignoreExtraArgs: true }).thenReturn(db);
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
      verify(db.put(sessionKey, { lists: {} }));
    });
  });
});
