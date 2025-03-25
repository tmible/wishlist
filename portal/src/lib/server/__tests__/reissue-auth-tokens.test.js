import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { REFRESH_TOKEN_COOKIE_NAME } from '$lib/constants/refresh-token-cookie-name.const';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/refresh-token-cookie-options.const';
import { generateAndStoreAuthTokens } from '$lib/server/generate-and-store-auth-tokens';
import { reissueAuthTokens } from '../reissue-auth-tokens.js';

const cookies = { get: vi.fn(), delete: vi.fn() };
const userid = 'userid';
const get = vi.fn();

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('$lib/server/generate-and-store-auth-tokens');

describe('reissueAuthTokens', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce({ get });
    cookies.get.mockReturnValue('refresh token');
    get.mockReturnValue({ token: 'refresh token', userid, expires: 1 });
    vi.spyOn(Date, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get refresh token from cookie', async () => {
    await reissueAuthTokens(cookies);
    expect(cookies.get).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE_NAME);
  });

  it('should inject get refresh token statement', async () => {
    await reissueAuthTokens(cookies);
    expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.GetRefreshTokenStatement);
  });

  it('should get refresh token from DB', async () => {
    cookies.get.mockReturnValueOnce('refresh token').mockReturnValueOnce('unknownUserUuid');
    await reissueAuthTokens(cookies);
    expect(get).toHaveBeenCalledWith('unknownUserUuid');
  });

  describe('if there is no refresh token in cookie', () => {
    beforeEach(() => {
      cookies.get.mockReturnValue();
    });

    it('should delete cookie', async () => {
      try {
        await reissueAuthTokens(cookies);
      } catch {
        expect(
          cookies.delete,
        ).toHaveBeenCalledWith(
          REFRESH_TOKEN_COOKIE_NAME,
          REFRESH_TOKEN_COOKIE_OPTIONS,
        );
      }
    });

    it('should throw error', async () => {
      await expect(reissueAuthTokens(cookies)).rejects.toThrow('Token is invalid');
    });
  });

  describe('if there is no refresh token in DB', () => {
    beforeEach(() => {
      get.mockReturnValueOnce({});
    });

    it('should delete cookie', async () => {
      try {
        await reissueAuthTokens(cookies);
      } catch {
        expect(
          cookies.delete,
        ).toHaveBeenCalledWith(
          REFRESH_TOKEN_COOKIE_NAME,
          REFRESH_TOKEN_COOKIE_OPTIONS,
        );
      }
    });

    it('should throw error', async () => {
      await expect(reissueAuthTokens(cookies)).rejects.toThrow('Token is invalid');
    });
  });

  describe('if refresh tokens from cookie and DB are not equal', () => {
    beforeEach(() => {
      cookies.get.mockReturnValue('refresh token 1');
      get.mockReturnValueOnce({ token: 'refresh token 2' });
    });

    it('should delete cookie', async () => {
      try {
        await reissueAuthTokens(cookies);
      } catch {
        expect(
          cookies.delete,
        ).toHaveBeenCalledWith(
          REFRESH_TOKEN_COOKIE_NAME,
          REFRESH_TOKEN_COOKIE_OPTIONS,
        );
      }
    });

    it('should throw error', async () => {
      await expect(reissueAuthTokens(cookies)).rejects.toThrow('Token is invalid');
    });
  });

  describe('if tokens are equal, but expiration is undefined', () => {
    beforeEach(() => {
      get.mockReturnValueOnce({ token: 'refresh token', expires: undefined });
      vi.spyOn(Date, 'now').mockReturnValueOnce(1);
    });

    it('should delete cookie', async () => {
      try {
        await reissueAuthTokens(cookies);
      } catch {
        expect(
          cookies.delete,
        ).toHaveBeenCalledWith(
          REFRESH_TOKEN_COOKIE_NAME,
          REFRESH_TOKEN_COOKIE_OPTIONS,
        );
      }
    });

    it('should throw error', async () => {
      await expect(reissueAuthTokens(cookies)).rejects.toThrow('Token expired');
    });
  });

  describe('if tokens are equal, but expired', () => {
    beforeEach(() => {
      get.mockReturnValueOnce({ token: 'refresh token', expires: 1 });
      vi.spyOn(Date, 'now').mockReturnValueOnce(2000);
    });

    it('should delete cookie', async () => {
      try {
        await reissueAuthTokens(cookies);
      } catch {
        expect(
          cookies.delete,
        ).toHaveBeenCalledWith(
          REFRESH_TOKEN_COOKIE_NAME,
          REFRESH_TOKEN_COOKIE_OPTIONS,
        );
      }
    });

    it('should throw error', async () => {
      await expect(reissueAuthTokens(cookies)).rejects.toThrow('Token expired');
    });
  });

  it('should generate and store new pair of tokens', async () => {
    await reissueAuthTokens(cookies);
    expect(vi.mocked(generateAndStoreAuthTokens)).toHaveBeenCalledWith(cookies, userid);
  });
});
