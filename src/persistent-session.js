import getSessionKey from '@tmible/wishlist-bot/helpers/get-session-key';
import { getLocalDB } from '@tmible/wishlist-bot/services/local-db';

/** @module Персистентная относительно запусков бота сессия */

/**
 * Объект для доступа к БД
 * @type {ClassicLevel}
 */
let db;

/**
 * [Получение]{@link getLocalDB} объекта для доступа к БД и создание промежуточного обработчика
 * для работы персистентной относительно запусков бота сессии
 * Промежуточный обработчик получает по [ключу]{@link getSessionKey} объект из БД,
 * определяет в сессии свойство persistent, предоставляющее доступ к объекту из БД,
 * вызывает следующие промежуточные обработчики и после завершения их работы, если необходимо,
 * синхронизирует изменённый в процессе работы объект с его оригиналом в БД
 * @function initPersistentSession
 * @returns {MiddlewareFn<Context>} Промежуточный обработчик для работы персистентной относительно запусков бота сессии
 */
export const initPersistentSession = () => {
  db = getLocalDB('persistent-session');

  return async (ctx, next) => {
    let cached;
    let touched = false;

    const key = getSessionKey(ctx);

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
      delete ctx.session.persistent;
    }

  };
};

/**
 * Установка оригинала персистентной относительно запусков бота сессии в БД в значение по умолчанию
 * @async
 * @function dropPersistentSession
 * @param {Context} ctx Контекст
 */
export const dropPersistentSession = async (ctx) => {
  if (Object.hasOwn(ctx.session, 'persistent')) {
    ctx.session.persistent = { lists: {} };
  }
  await db.put(getSessionKey(ctx), { lists: {} });
};
