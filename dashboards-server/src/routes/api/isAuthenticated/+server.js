import { promisify } from 'node:util';
import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { HMAC_SECRET } from '$env/static/private';
import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const.js';

/**
 * Проверка аутентифицированности пользователя
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ cookies }) => {
  if (!cookies.get(AUTH_TOKEN_COOKIE_NAME)) {
    return json(false);
  }

  try {
    await promisify(jwt.verify)(cookies.get(AUTH_TOKEN_COOKIE_NAME), HMAC_SECRET);
  } catch {
    return json(false);
  }

  return json(true);
};
