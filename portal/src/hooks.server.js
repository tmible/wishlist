import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const';
import { initDB } from '$lib/server/db';
import { connectToIPCHub } from '$lib/server/ipc-hub-connection';

/**
 * Промежуточный обработчик, возвращающий ошибку, если в запросе нет
 * cookie-файла, содержащего jwt-токен аутентификации или токен в файле
 * недействителен, и добавляющий userid из jwt-токена в запрос иначе
 * @type {import('@sveltejs/kit').Handle}
 */
export const handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api/wishlist')) {
    if (!event.cookies.get(AUTH_TOKEN_COOKIE_NAME)) {
      return new Response(null, { status: 401 });
    }

    try {
      await promisify(jwt.verify)(
        event.cookies.get(AUTH_TOKEN_COOKIE_NAME),
        env.HMAC_SECRET,
      ).then(
        ({ userid }) => event.locals.userid = userid,
      );
    } catch {
      return new Response(null, { status: 401 });
    }
  }

  return await resolve(event);
};

/**
 * Открытие подключения к БД при старте приложения
 */
await initDB();

/**
 * Подключение к IPC хабу при старте приложения
 */
connectToIPCHub();
