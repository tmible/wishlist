import { redirect } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const';
import { AUTH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/auth-token-cookie-options.const';
import { AUTH_TOKEN_EXPIRATION } from '$lib/constants/auth-token-expiration.const';
import { GET } from '../+server.js';

vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock('@sveltejs/kit');
vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('jsonwebtoken');
vi.mock(
  '$env/dynamic/private',
  () => ({ env: { HMAC_SECRET: 'HMAC secret', BOT_TOKEN: 'bot token' } }),
);

// HMAC-SHA256 подпись пустой строки с ключом SHA-256 хэшем от строки "bot token"
const HMAC_SHA256_SIGNATURE = '05f584e13f09851dbc638a0d341b04a358adf7b0bbc0b43362de10d8f94cecb4';

describe('authSuccess endpoint', () => {
  let cookies;
  let url;

  beforeEach(() => {
    cookies = {
      get: vi.fn(),
      set: vi.fn(),
    };
    url = { searchParams: { get: vi.fn(), keys: vi.fn(() => []) } };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return error if there is no hash parameter', async () => {
    const response = await GET({ cookies, url });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('missing hash parameter');
  });

  it('should return error if hash parameter is not of length 64', async () => {
    url.searchParams.get.mockReturnValueOnce('hash');
    const response = await GET({ cookies, url });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('hash parameter is invalid');
  });

  it(
    'should return error if has parameter does not equal HMAC-SHA256 signature of parameters',
    async () => {
      url.searchParams.get.mockReturnValueOnce(HMAC_SHA256_SIGNATURE.replace('4', 'x'));
      const response = await GET({ cookies, url });
      expect(response.status).toBe(403);
      expect(await response.text()).toBe('data integrity is compromised');
    },
  );

  it('should return error if there is no id parameter', async () => {
    url.searchParams.get.mockReturnValueOnce(HMAC_SHA256_SIGNATURE).mockReturnValueOnce(null);
    const response = await GET({ cookies, url });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('missing id parameter');
  });

  describe('if hash is ok and there is id parameter', () => {
    let statement;

    beforeEach(() => {
      url.searchParams.get.mockReturnValueOnce(HMAC_SHA256_SIGNATURE).mockReturnValueOnce('userid');
      statement = { run: vi.fn() };
      vi.mocked(inject).mockReturnValue(statement);
    });

    it('should inject AddUserStatement', async () => {
      await GET({ cookies, url });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.AddUserStatement);
    });

    it('should run AddUserStatement', async () => {
      await GET({ cookies, url });
      expect(statement.run).toHaveBeenCalledWith('userid', null);
    });

    it('should run AddUserStatement with username', async () => {
      url.searchParams.get.mockReturnValueOnce('username');
      await GET({ cookies, url });
      expect(statement.run).toHaveBeenCalledWith('userid', 'username');
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

    describe('if there is unknown user UUID', () => {
      beforeEach(async () => {
        cookies.get.mockReturnValueOnce('unknownUserUuid');
        vi.stubGlobal('Date', { now: vi.fn(() => 'now') });
        await GET({ cookies, url });
      });

      it('should inject AddUserStatement', () => {
        expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.AddActionStatement);
      });

      it('should add action', () => {
        expect(statement.run).toHaveBeenCalledWith('now', 'authentication', 'unknownUserUuid');
      });
    });

    describe('if there is no unknown user UUID', () => {
      beforeEach(async () => {
        cookies.get.mockReturnValueOnce(null);
        await GET({ cookies, url });
      });

      it('should inject AddUserStatement', () => {
        expect(vi.mocked(inject)).not.toHaveBeenCalledWith(InjectionToken.AddActionStatement);
      });

      it('should add action', () => {
        expect(statement.run).not.toHaveBeenCalledWith('now', 'authentication', 'unknownUserUuid');
      });
    });

    it('should return redirect', async () => {
      vi.mocked(redirect).mockImplementation((status, location) => [ status, location ]);
      expect(await GET({ cookies, url })).toEqual([ 302, '/list' ]);
    });
  });
});
