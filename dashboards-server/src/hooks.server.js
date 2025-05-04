import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const.js';
import { initBotUserUpdatesFeature } from '$lib/server/bot-user-updates/initialization.js';
import { initDB } from '$lib/server/db/index.js';

/**
 * Промежуточный обработчик, возвращающий ошибку, если в запросе нет cookie-файла, содержащего
 * jwt-токен аутентификации или токен в файле недействителен
 * @type {import('@sveltejs/kit').Handle}
 */
export const handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api/data/')) {
    if (!event.cookies.get(AUTH_TOKEN_COOKIE_NAME)) {
      return new Response(null, { status: 401 });
    }

    try {
      await promisify(jwt.verify)(event.cookies.get(AUTH_TOKEN_COOKIE_NAME), env.HMAC_SECRET);
    } catch {
      return new Response(null, { status: 401 });
    }
  }

  return await resolve(event);
};

// Открытие подключения к БД при старте приложения
initDB();

// Инициализация модуля обновлений, полученных ботом
initBotUserUpdatesFeature();
