import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_TOKEN_COOKIE_NAME } from '$lib/constants/auth-token-cookie-name.const.js';
import { AUTH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/auth-token-cookie-options.const.js';
import { POST } from '../+server.js';

describe('logout endpoint', () => {
  let cookies;

  beforeEach(() => {
    cookies = { delete: () => {} };
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should delete cookie', async () => {
    vi.spyOn(cookies, 'delete');
    await POST({ cookies });
    expect(cookies.delete).toHaveBeenCalledWith(AUTH_TOKEN_COOKIE_NAME, AUTH_TOKEN_COOKIE_OPTIONS);
  });

  it('should return response', async () => {
    const response = await POST({ cookies });
    expect(response.status).toEqual(200);
    expect(response.body).toBeNull();
  });
});
