import { ClassicLevel } from 'classic-level';
import getSessionKey from 'wishlist-bot/helpers/get-session-key';

/** @module Персистентная относительно запусков бота сессия */

/**
 * Объект для доступа к БД
 */
let db;

/**
 * Инициализация объекта для доступа к БД и создание промежуточного обработчика
 * для работы персистентной относительно запусков бота сессии
 * Промежуточный обработчик получает по [ключу]{@link getSessionKey} объект из БД,
 * определяет в сессии свойство persistent, предоставляющее доступ к объекту из БД,
 * если оно ещё не определено (сессия персистентна относительно получения обновлений от пользователя),
 * вызывает следующие промежуточные обработчики и после завершения их работы, если необходимо,
 * синхронизирует изменённый в процессе работы объект с его оригиналом в БД
 * @function initPersistentSession
 * @returns {MiddlewareFn<Context>} Промежуточный обработчик для работы персистентной относительно запусков бота сессии
 */
export const initPersistentSession = () => {
  db = new ClassicLevel(process.env.PERSISTENT_SESSION_PATH, { valueEncoding: 'json' });

  let cached;
  let touched = false;

  return async (ctx, next) => {
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

    if (!Object.hasOwn(ctx.session, 'persistent')) {
      Object.defineProperty(ctx.session, 'persistent', {
        get: () => {
          touched = true;
          return cached;
        },
        set: (value) => {
          touched = true;
          cached = value;
        },
      });
    }

    try {
      await next();
    } finally {
      if (touched) {
        await db.put(key, cached);
      }
      touched = false;
    }

  };
};

/**
 * Установка оригинала персистентной относительно запусков бота сессии в БД в значение по умолчанию
 * @async
 * @function dropPersistentSession
 * @param {Context} ctx Контекст
 */
export const dropPersistentSession = (ctx) => db.put(getSessionKey(ctx), { lists: {} });

/**
 * Закрытие [подключения к БД]{@link db}
 * @async
 * @function destroyPersistentSession
 */
export const destroyPersistentSession = () => db.close();
