import { afterEach, describe, expect, it, vi } from 'vitest';
import { getUser } from '$lib/server/user/use-cases/get-user.js';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock('jsonwebtoken');
vi.mock('$lib/server/user/use-cases/get-user.js');

describe('user endpoint', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get user', async () => {
    await GET({ cookies: 'cookies' });
    expect(vi.mocked(getUser)).toHaveBeenCalledWith('cookies');
  });

  it('should return user', async () => {
    vi.mocked(getUser).mockReturnValueOnce('user');
    expect(await GET({})).toBe('user');
  });
});
