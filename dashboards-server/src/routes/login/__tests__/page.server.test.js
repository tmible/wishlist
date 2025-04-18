import { timingSafeEqual } from 'node:crypto';
import { fail } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const.js';
import { AUTH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/auth-token-cookie-options.const.js';
import { AUTH_TOKEN_EXPIRATION } from '$lib/constants/auth-token-expiration.const.js';
import { actions } from '../+page.server.js';

const adminPassword = Buffer.from([ '12', '34' ].map((byte) => Number.parseInt(byte, 16)));

vi.mock('node:crypto');
vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock(
  '$env/dynamic/private',
  () => ({
    env: {
      ADMIN_PASSWORD: '1234',
      HMAC_SECRET: 'HMAC secret',
    },
  }),
);
vi.mock('@tmible/wishlist-common/sha-256', () => ({ sha256Raw: () => 'hash' }));
vi.mock('jsonwebtoken', () => ({ default: { sign: () => {} } }));

describe('login endpoint', () => {
  let cookies;
  let request;

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should use timig safe equality check', async () => {
    cookies = { set: () => {} };
    request = { formData: () => ({ get: () => 'admin' }) };
    await actions.default({ cookies, request });
    expect(vi.mocked(timingSafeEqual)).toHaveBeenCalledWith('hash', adminPassword);
  });

  describe('if login and password are correct', () => {
    beforeEach(() => {
      cookies = { set: () => {} };
      request = { formData: () => ({ get: () => 'admin' }) };
      vi.mocked(timingSafeEqual).mockReturnValueOnce(true);
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
