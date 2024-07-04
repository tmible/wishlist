import { fail } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const.js';
import { AUTH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/auth-token-cookie-options.const.js';
import { AUTH_TOKEN_EXPIRATION } from '$lib/constants/auth-token-expiration.const.js';
import { actions } from '../+page.server.js';

vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock(
  '$env/dynamic/private',
  () => ({
    env: {
      ADMIN_PASSWORD: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
      HMAC_SECRET: 'HMAC secret',
    },
  }),
);
vi.mock('jsonwebtoken', () => ({ default: { sign: () => {} } }));

describe('login endpoint', () => {
  let cookies;
  let request;

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('if login and password are correct', () => {
    beforeEach(() => {
      cookies = { set: () => {} };
      request = { formData: () => ({ get: () => 'admin' }) };
    });

    afterEach(() => {
      cookies = undefined;
      request = undefined;
    });

    it('should create token', async () => {
      vi.spyOn(jwt, 'sign');
      await actions.default({ cookies, request });
      expect(
        jwt.sign,
      ).toHaveBeenCalledWith(
        { login: 'admin' },
        'HMAC secret',
        { expiresIn: `${AUTH_TOKEN_EXPIRATION / 60}min` },
      );
    });

    it('should set toket to cookie', async () => {
      vi.spyOn(jwt, 'sign').mockReturnValue('token');
      vi.spyOn(cookies, 'set');
      await actions.default({ cookies, request });
      expect(
        cookies.set,
      ).toHaveBeenCalledWith(
        AUTH_TOKEN_COOKIE_NAME,
        'token',
        AUTH_TOKEN_COOKIE_OPTIONS,
      );
    });

    it('should return success', async () => {
      expect(await actions.default({ cookies, request })).toEqual({ success: true });
    });
  });

  it('should return fail otherwise', async () => {
    request = { formData: () => ({ get: (key) => key }) };
    expect(
      await actions.default({ cookies, request }),
    ).toEqual(
      fail(401, { error: 'login failed' }),
    );
  });
});
