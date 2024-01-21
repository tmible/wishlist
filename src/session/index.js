import { ClassicLevel } from 'classic-level';
import getSessionKey from 'wishlist-bot/helpers/get-session-key';

let db;

export const initPersistentSession = () => {
  db = new ClassicLevel('persistent-session.db', { valueEncoding: 'json' });

  let touched = false;

  return async (ctx, next) => {
    const key = getSessionKey(ctx);
    let cached;

    try {
      cached = await db.get(key);
    } catch(e) {
      if (e.code !== 'LEVEL_NOT_FOUND') {
        throw(e);
      }
      await dropPersistentSession(ctx);
      cached = await db.get(key);
    }

    Object.defineProperty(ctx.session, 'persistent', {
      get: () => {
        touched = true;
        return cached;
      },
      set: (value) => {
        touched = true;
        cached = value;
      },
      configurable: true,
    });

    try {
      await next();
    } finally {
      if (touched) {
        await db.put(key, cached);
      }
    }

  };
};

export const dropPersistentSession = (ctx) => db.put(getSessionKey(ctx), { lists: {} });

export const destroyPersistentSession = () => db.close();
