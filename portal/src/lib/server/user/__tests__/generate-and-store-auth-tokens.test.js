import { randomUUID } from 'node:crypto';
import { emit } from '@tmible/wishlist-common/event-bus';
import jwt from 'jsonwebtoken';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACCESS_TOKEN_COOKIE_NAME } from '$lib/constants/access-token-cookie-name.const.js';
import { ACCESS_TOKEN_COOKIE_OPTIONS } from '$lib/constants/access-token-cookie-options.const.js';
import { ACCESS_TOKEN_EXPIRATION } from '$lib/constants/access-token-expiration.const.js';
import { REFRESH_TOKEN_COOKIE_NAME } from '$lib/constants/refresh-token-cookie-name.const.js';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/refresh-token-cookie-options.const.js';
import { REFRESH_TOKEN_EXPIRATION } from '$lib/constants/refresh-token-expiration.const.js';
import { StoreRefreshToken } from '../events.js';
import { generateAndStoreAuthTokens } from '../generate-and-store-auth-tokens.js';

const cookies = { get: vi.fn(), set: vi.fn() };
const userid = 'userid';

vi.mock('node:crypto');
vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('jsonwebtoken');
vi.mock('$env/dynamic/private', () => ({ env: { HMAC_SECRET: 'HMAC secret' } }));

describe('user / generateAndStoreAuthTokens', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should issue jwt for access token', async () => {
    await generateAndStoreAuthTokens(cookies, userid);
    expect(
      vi.mocked(jwt.sign),
    ).toHaveBeenCalledWith(
      { userid },
      'HMAC secret',
      { expiresIn: `${ACCESS_TOKEN_EXPIRATION / 60}min` },
    );
  });

  it('should use randomUUID fot refresh token', async () => {
    await generateAndStoreAuthTokens(cookies, userid);
    expect(vi.mocked(randomUUID)).toHaveBeenCalled();
  });

  it('should set access token to cookie', async () => {
    vi.mocked(jwt.sign).mockImplementationOnce(() => 'access token');
    await generateAndStoreAuthTokens(cookies, userid);
    expect(
      cookies.set,
    ).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE_NAME,
      'access token',
      ACCESS_TOKEN_COOKIE_OPTIONS,
    );
  });

  it('should store refresh token in DB', async () => {
    cookies.get.mockReturnValueOnce('unknownUserUuid');
    vi.mocked(randomUUID).mockImplementationOnce(() => 'refresh token');
    vi.spyOn(Date, 'now').mockReturnValueOnce('now');
    await generateAndStoreAuthTokens(cookies, userid);
    expect(
      vi.mocked(emit),
    ).toHaveBeenCalledWith(
      StoreRefreshToken,
      'refresh token',
      `now${REFRESH_TOKEN_EXPIRATION * 1000}`,
      userid,
      'unknownUserUuid',
    );
  });

  it('should set refresh token to cookie', async () => {
    vi.mocked(randomUUID).mockImplementationOnce(() => 'refresh token');
    await generateAndStoreAuthTokens(cookies, userid);
    expect(
      cookies.set,
    ).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE_NAME,
      'refresh token',
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
  });
});
