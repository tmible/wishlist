import { afterEach, describe, expect, it, vi } from 'vitest';
import { logout } from '$lib/server/user/use-cases/logout.js';
import { POST } from '../+server.js';

vi.mock('$lib/server/user/use-cases/logout.js');

describe('logout endpoint', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should logout', async () => {
    await POST({ cookies: 'cookies' });
    expect(vi.mocked(logout)).toHaveBeenCalledWith('cookies');
  });

  it('should return response', async () => {
    const response = await POST({});
    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });
});
