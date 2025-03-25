import { promisify } from 'node:util';
import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { ACCESS_TOKEN_COOKIE_NAME } from '$lib/constants/access-token-cookie-name.const.js';

/**
 * Проверка аутентифицированности пользователя
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ cookies }) => {
  if (!cookies.get(ACCESS_TOKEN_COOKIE_NAME)) {
    return json({ id: null, isAuthenticated: false });
  }

  let decoded;
  try {
    decoded = await promisify(jwt.verify)(cookies.get(ACCESS_TOKEN_COOKIE_NAME), env.HMAC_SECRET);
  } catch {
    return json({ id: null, isAuthenticated: false });
  }

  return json({ id: decoded.userid, isAuthenticated: true });
};
