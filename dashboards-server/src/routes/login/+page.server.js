import { promisify } from 'node:util';
import { fail } from '@sveltejs/kit';
import sha256 from '@tmible/wishlist-common/sha-256';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const.js';
import { AUTH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/auth-token-cookie-options.const.js';
import { AUTH_TOKEN_EXPIRATION } from '$lib/constants/auth-token-expiration.const.js';

/** @typedef {import('./$types').Actions} Actions */

/**
 * Аутентификация пользователя и создание cookie-файла с jwt-токеном аутентификации
 * @type {Actions}
 */
export const actions = {
  default: async ({ cookies, request }) => {
    const formData = await request.formData();
    const login = formData.get('login');
    const password = formData.get('password');

    if (login === 'admin' && await sha256(password) === env.ADMIN_PASSWORD) {
      const token = await promisify(jwt.sign)(
        { login: 'admin' },
        env.HMAC_SECRET,
        { expiresIn: `${AUTH_TOKEN_EXPIRATION / 60}min` },
      );
      cookies.set(AUTH_TOKEN_COOKIE_NAME, token, AUTH_TOKEN_COOKIE_OPTIONS);
      return { success: true };
    }

    return fail(401, { error: 'login failed' });
  },
};
