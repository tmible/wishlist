import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const.js';
import { AUTH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/auth-token-cookie-options.const.js';

/**
 * Разлогинивание пользователя
 * @type {import('./$types').RequestHandler}
 */
export const POST = ({ cookies }) => {
  cookies.delete(AUTH_TOKEN_COOKIE_NAME, AUTH_TOKEN_COOKIE_OPTIONS);
  return new Response(null, { status: 200 });
};
