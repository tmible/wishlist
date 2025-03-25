import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { ACCESS_TOKEN_COOKIE_NAME } from '$lib/constants/access-token-cookie-name.const.js';
import { ACCESS_TOKEN_COOKIE_OPTIONS } from '$lib/constants/access-token-cookie-options.const.js';
import { REFRESH_TOKEN_COOKIE_NAME } from '$lib/constants/refresh-token-cookie-name.const.js';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/refresh-token-cookie-options.const.js';
import { POST } from '../+server.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

const cookies = { get: vi.fn(), delete: vi.fn() };
const run = vi.fn();

describe('logout endpoint', () => {
  beforeEach(() => {
    cookies.get.mockReturnValue('refresh token');
    vi.mocked(inject).mockReturnValue({ run });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should delete access token cookie', async () => {
    await POST({ cookies });
    expect(
      cookies.delete,
    ).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE_NAME,
      ACCESS_TOKEN_COOKIE_OPTIONS,
    );
  });

  it('should inject delete refresh token statement', async () => {
    await POST({ cookies });
    expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.DeleteRefreshTokenStatement);
  });

  it('should delete refresh token', async () => {
    await POST({ cookies });
    expect(run).toHaveBeenCalledWith('refresh token');
  });

  it('should delete refresh token cookie', async () => {
    await POST({ cookies });
    expect(
      cookies.delete,
    ).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE_NAME,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
  });

  it('should return response', async () => {
    const response = await POST({ cookies });
    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });
});
