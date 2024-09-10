import { inject } from '@tmible/wishlist-common/dependency-injector';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import getSessionKey from '@tmible/wishlist-bot/helpers/get-session-key';

/**
 * @typedef {import('telegraf').Context} Context
 * @typedef {import('telegraf').MiddlewareFn} MiddlewareFn
 * @typedef {import('classic-level').ClassicLevel} ClassicLevel
 */

/** @module Персистентная относительно запусков бота сессия */

/**
 * Установка оригинала персистентной относительно запусков бота сессии в БД в значение по умолчанию
 * @function dropPersistentSession
 * @param {Context} ctx Контекст
 * @async
 */
export const dropPersistentSession = async (ctx) => {
  if (Object.hasOwn(ctx.session, 'persistent')) {
    ctx.session.persistent = { lists: {} };
  }
  await inject(InjectionToken.LocalDatabase)('persistent-session').put(
    getSessionKey(ctx),
    { lists: {} },
  );
};

/**
 * Получение по ключу объекта из БД. В случае отсутствия в БД значения по переданному ключу
 * [устанавливается значение по умолчанию]{@link dropPersistentSession}
 * @function getPersistentSessionFromDB
 * @param {ClassicLevel} db Объект для доступа к БД
 * @param {Context} ctx Контекст
 * @param {number} key Ключ сессии
 * @returns {Promise<unknown>} Значение из БД, полученное по ключу
 * @async
 */
const getPersistentSessionFromDB = async (db, ctx, key) => {
  try {
    return await db.get(key);
  } catch (e) {
    if (e.code !== 'LEVEL_NOT_FOUND') {
      throw e;
    }
    await dropPersistentSession(ctx);
  }

  return db.get(key);
};

/**
 * Получение объекта для доступа к БД и создание промежуточного обработчика
 * для работы персистентной относительно запусков бота сессии
 * Промежуточный обработчик [получает]{@link getPersistentSessionFromDB}
 * по [ключу]{@link getSessionKey} объект из БД, определяет в сессии свойство persistent,
 * предоставляющее доступ к объекту из БД, вызывает следующие промежуточные обработчики
 * и после завершения их работы, если необходимо, синхронизирует изменённый в процессе работы
 * объект с его оригиналом в БД
 * @function persistentSession
 * @returns {MiddlewareFn<Context>} Промежуточный обработчик для работы персистентной
 *   относительно запусков бота сессии
 */
export const persistentSession = () => {
  const db = inject(InjectionToken.LocalDatabase)('persistent-session');

  return async (ctx, next) => {
    let cached;
    let touched = false;

    const key = getSessionKey(ctx);

    cached = await getPersistentSessionFromDB(db, ctx, key);

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
      delete ctx.session.persistent;
    }

  };
};
