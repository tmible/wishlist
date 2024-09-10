import { redirect } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const';
import { AUTH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/auth-token-cookie-options.const';
import { AUTH_TOKEN_EXPIRATION } from '$lib/constants/auth-token-expiration.const';
import { GET } from '../+server.js';

vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock('@sveltejs/kit');
vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('jsonwebtoken');
vi.mock('$env/dynamic/private', () => ({ env: { HMAC_SECRET: 'HMAC secret' } }));

describe('authSuccess endpoint', () => {
  let cookies;
  let url;

  beforeEach(() => {
    cookies = {
      get: vi.fn(),
      set: vi.fn(),
    };
    url = { searchParams: { get: vi.fn() } };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return error if there is no id parameter', async () => {
    url.searchParams.get.mockReturnValue(null);
    const response = await GET({ cookies, url });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('missing id parameter');
  });

  describe('if there is id parameter', () => {
    let statement;

    beforeEach(() => {
      url.searchParams.get.mockReturnValue('userid');
      statement = { run: vi.fn() };
      vi.mocked(inject).mockReturnValue(statement);
    });

    it('should run AddUserStatement', async () => {
      await GET({ cookies, url });
      expect(statement.run).toHaveBeenCalledWith('userid', 'userid');
    });

    it('should create jwt', async () => {
      await GET({ cookies, url });
      expect(
        vi.mocked(jwt.sign),
      ).toHaveBeenCalledWith(
        { userid: 'userid' },
        'HMAC secret',
        { expiresIn: `${AUTH_TOKEN_EXPIRATION / 60}min` },
      );
    });

    it('should set cookie', async () => {
      vi.mocked(jwt.sign).mockReturnValue('token');
      await GET({ cookies, url });
      expect(
        cookies.set,
      ).toHaveBeenCalledWith(
        AUTH_TOKEN_COOKIE_NAME,
        'token',
        AUTH_TOKEN_COOKIE_OPTIONS,
      );
    });

    it('should return redirect', async () => {
      vi.mocked(redirect).mockImplementation((status, location) => [ status, location ]);
      expect(await GET({ cookies, url })).toEqual([ 302, '/list' ]);
    });
  });
});
