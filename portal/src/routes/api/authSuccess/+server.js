import { promisify } from 'node:util';
import { redirect } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { InjectionToken } from '$lib/architecture/injection-token';
import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const';
import { AUTH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/auth-token-cookie-options.const';
import { AUTH_TOKEN_EXPIRATION } from '$lib/constants/auth-token-expiration.const';

/**
 * Аутентификация пользователя и создание cookie-файла с jwt-токеном аутентификации
 * @type {import('./$types').RequestHandler}
 */
export const GET = async ({ cookies, url }) => {
  const userid = url.searchParams.get('id');

  if (!userid) {
    return new Response('missing id parameter', { status: 400 });
  }

  inject(InjectionToken.AddUserStatement).run(userid, url.searchParams.get('username') ?? null);

  const token = await promisify(jwt.sign)(
    { userid },
    env.HMAC_SECRET,
    { expiresIn: `${AUTH_TOKEN_EXPIRATION / 60}min` },
  );
  cookies.set(AUTH_TOKEN_COOKIE_NAME, token, AUTH_TOKEN_COOKIE_OPTIONS);

  return redirect(302, '/list');
};
