import { inject } from '@tmible/wishlist-common/dependency-injector';
import { InjectionToken } from '$lib/architecture/injection-token';
import { ACCESS_TOKEN_COOKIE_NAME } from '$lib/constants/access-token-cookie-name.const.js';
import { ACCESS_TOKEN_COOKIE_OPTIONS } from '$lib/constants/access-token-cookie-options.const.js';
import { REFRESH_TOKEN_COOKIE_NAME } from '$lib/constants/refresh-token-cookie-name.const.js';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/refresh-token-cookie-options.const.js';

/**
 * Разлогинивание пользователя
 * @type {import('./$types').RequestHandler}
 */
export const POST = ({ cookies }) => {
  cookies.delete(ACCESS_TOKEN_COOKIE_NAME, ACCESS_TOKEN_COOKIE_OPTIONS);
  inject(InjectionToken.DeleteRefreshTokenStatement).run(cookies.get(REFRESH_TOKEN_COOKIE_NAME));
  cookies.delete(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS);
  return new Response(null, { status: 200 });
};
