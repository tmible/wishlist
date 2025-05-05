import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACCESS_TOKEN_COOKIE_NAME } from '$lib/constants/access-token-cookie-name.const.js';
import { ACCESS_TOKEN_COOKIE_OPTIONS } from '$lib/constants/access-token-cookie-options.const.js';
import { REFRESH_TOKEN_COOKIE_NAME } from '$lib/constants/refresh-token-cookie-name.const.js';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/refresh-token-cookie-options.const.js';
import { DeleteRefreshToken } from '../../events.js';
import { logout } from '../logout.js';

vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../../events.js', () => ({ DeleteRefreshToken: 'delete refresh token' }));

const cookies = { get: vi.fn(), delete: vi.fn() };

describe('user / use cases / logout', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should delete access token cookie', () => {
    logout(cookies);
    expect(
      cookies.delete,
    ).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE_NAME,
      ACCESS_TOKEN_COOKIE_OPTIONS,
    );
  });

  it('should emit DeleteRefreshToken event', () => {
    cookies.get.mockReturnValueOnce('refresh token');
    logout(cookies);
    expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(DeleteRefreshToken), 'refresh token');
  });

  it('should delete refresh token cookie', () => {
    logout(cookies);
    expect(
      cookies.delete,
    ).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE_NAME,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
  });
});
