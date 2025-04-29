import { afterEach, describe, expect, it, vi } from 'vitest';
import { getUserHash } from '$lib/server/user/use-cases/get-user-hash.js';
import { GET } from '../+server.js';

vi.mock('$lib/server/user/use-cases/get-user-hash.js');

const locals = { userid: 'userid' };

describe('user hash endpoint', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get hash', async () => {
    await GET({ locals });
    expect(vi.mocked(getUserHash)).toHaveBeenCalledWith('userid');
  });

  it('should return hash', async () => {
    vi.mocked(getUserHash).mockResolvedValueOnce('hash');
    const response = await GET({ locals });
    await expect(response.text()).resolves.toBe('hash');
  });
});
