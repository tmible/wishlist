import { redirect } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addAction } from '$lib/server/actions/use-cases/add-action.js';
import { generateAndStoreAuthTokens } from '$lib/server/user/generate-and-store-auth-tokens.js';
import { addUser } from '$lib/server/user/use-cases/add-user.js';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit');
vi.mock(
  '$env/dynamic/private',
  () => ({ env: { HMAC_SECRET: 'HMAC secret', BOT_TOKEN: 'bot token' } }),
);
vi.mock('$lib/server/actions/use-cases/add-action.js');
vi.mock('$lib/server/user/generate-and-store-auth-tokens.js');
vi.mock('$lib/server/user/use-cases/add-user.js');

vi.stubGlobal('URLSearchParams', vi.fn((original) => original));

// HMAC-SHA256 подпись пустой строки с ключом SHA-256 хэшем от строки "bot token"
const HMAC_SHA256_SIGNATURE = '05f584e13f09851dbc638a0d341b04a358adf7b0bbc0b43362de10d8f94cecb4';

const searchParams = new Map();
const url = {
  searchParams: {
    get: vi.fn((key) => searchParams.get(key)),
    delete: vi.fn(),
    keys: vi.fn(() => []),
  },
};

describe('authSuccess endpoint', () => {
  beforeEach(() => {
    searchParams.clear();
    searchParams.set('hash', HMAC_SHA256_SIGNATURE);
    searchParams.set('id', 'userid');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return error if there is no hash parameter', async () => {
    searchParams.delete('hash');
    const response = await GET({ url });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('missing hash parameter');
  });

  it('should return error if hash parameter is not of length 64', async () => {
    searchParams.set('hash', 'hash');
    const response = await GET({ url });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('hash parameter is invalid');
  });

  it(
    'should return error if has parameter does not equal HMAC-SHA256 signature of parameters',
    async () => {
      searchParams.set('hash', HMAC_SHA256_SIGNATURE.replace('4', 'x'));
      const response = await GET({ url });
      expect(response.status).toBe(403);
      expect(await response.text()).toBe('data integrity is compromised');
    },
  );

  it('should return error if there is no id parameter', async () => {
    searchParams.delete('id');
    const response = await GET({ url });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('missing id parameter');
  });

  describe('if hash is ok and there is id parameter', () => {
    it('should add user', async () => {
      await GET({ url });
      expect(vi.mocked(addUser)).toHaveBeenCalledWith('userid', null);
    });

    it('should add user with username', async () => {
      searchParams.set('username', 'username');
      await GET({ url });
      expect(vi.mocked(addUser)).toHaveBeenCalledWith('userid', 'username');
    });

    it('should add action', async () => {
      vi.spyOn(Date, 'now').mockReturnValueOnce('now');
      await GET({ cookies: 'cookies', url });
      expect(
        vi.mocked(addAction),
      ).toHaveBeenCalledWith(
        'now',
        'authentication',
        'cookies',
      );
    });

    it('should generate and store auth tokens', async () => {
      await GET({ cookies: 'cookies', url });
      expect(vi.mocked(generateAndStoreAuthTokens)).toHaveBeenCalledWith('cookies', 'userid');
    });

    it('should return redirect without "continue" search parameter', async () => {
      vi.mocked(redirect).mockImplementation((status, location) => [ status, location ]);
      expect(await GET({ url })).toEqual([ 302, '/list' ]);
    });

    it('should return redirect with "continue" search parameter', async () => {
      searchParams.set('continue', 'continue location');
      vi.mocked(redirect).mockImplementation((status, location) => [ status, location ]);
      const response = await GET({ url });
      searchParams.delete('continue');
      expect(response).toEqual([ 302, 'continue location' ]);
    });
  });
});
