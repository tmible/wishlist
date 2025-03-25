import { randomUUID } from 'node:crypto';
import { redirect } from '@sveltejs/kit';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { UNKNOWN_USER_UUID_COOKIE_NAME } from '$lib/constants/unknown-user-uuid-cookie-name.const';
import { generateAndStoreAuthTokens } from '$lib/server/generate-and-store-auth-tokens';
import { GET } from '../+server.js';

vi.mock('node:crypto');
vi.mock('@sveltejs/kit');
vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock(
  '$env/dynamic/private',
  () => ({ env: { HMAC_SECRET: 'HMAC secret', BOT_TOKEN: 'bot token' } }),
);
vi.mock('$lib/server/generate-and-store-auth-tokens');

// HMAC-SHA256 подпись пустой строки с ключом SHA-256 хэшем от строки "bot token"
const HMAC_SHA256_SIGNATURE = '05f584e13f09851dbc638a0d341b04a358adf7b0bbc0b43362de10d8f94cecb4';

const cookies = {
  get: vi.fn(),
  set: vi.fn(),
};
const url = { searchParams: { get: vi.fn(), keys: vi.fn(() => []) } };

describe('authSuccess endpoint', () => {
  beforeEach(() => {});

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
      expect(statement.run).toHaveBeenCalledWith({ userid: 'userid', username: null });
    });

    it('should run AddUserStatement with username', async () => {
      url.searchParams.get.mockReturnValueOnce('username');
      await GET({ cookies, url });
      expect(statement.run).toHaveBeenCalledWith({ userid: 'userid', username: 'username' });
    });

    describe('if there is unknown user UUID', () => {
      beforeEach(async () => {
        cookies.get.mockReturnValueOnce('unknownUserUuid');
        vi.spyOn(Date, 'now').mockReturnValueOnce('now');
        await GET({ cookies, url });
      });

      it('should inject add action statement', () => {
        expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.AddActionStatement);
      });

      it('should add action', () => {
        expect(statement.run).toHaveBeenCalledWith('now', 'authentication', 'unknownUserUuid');
      });
    });

    describe('if there is no unknown user UUID', () => {
      beforeEach(async () => {
        cookies.get.mockReturnValueOnce();
        vi.mocked(randomUUID).mockReturnValueOnce('random UUID');
        vi.spyOn(Date, 'now').mockReturnValueOnce('now');
        await GET({ cookies, url });
      });

      it('should generate it', () => {
        expect(vi.mocked(randomUUID)).toHaveBeenCalled();
      });

      it('should store it in cookie', () => {
        expect(cookies.set).toHaveBeenCalledWith(UNKNOWN_USER_UUID_COOKIE_NAME, 'random UUID');
      });

      it('should inject AddUserStatement', () => {
        expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.AddActionStatement);
      });

      it('should add action', () => {
        expect(statement.run).toHaveBeenCalledWith('now', 'authentication', 'random UUID');
      });
    });

    it('should generate and store auth tokens', async () => {
      await GET({ cookies, url });
      expect(vi.mocked(generateAndStoreAuthTokens)).toHaveBeenCalledWith(cookies, 'userid');
    });

    it('should return redirect', async () => {
      vi.mocked(redirect).mockImplementation((status, location) => [ status, location ]);
      expect(await GET({ cookies, url })).toEqual([ 302, '/list' ]);
    });
  });
});
