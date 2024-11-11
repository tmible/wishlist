import { inject } from '@tmible/wishlist-common/dependency-injector';
import sha256 from '@tmible/wishlist-common/sha-256';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { GET } from '../+server.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/sha-256');

describe('user hash endpoint', () => {
  let locals;
  let statement;

  beforeEach(() => {
    locals = { userid: 'userid' };
    statement = { get: vi.fn(), run: vi.fn() };
    vi.mocked(inject).mockReturnValue(statement);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should inject get statement', async () => {
    await GET({ locals });
    expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.GetUserHashStatement);
  });

  it('should get hash', async () => {
    await GET({ locals });
    expect(statement.get).toHaveBeenCalledWith('userid');
  });

  describe('if there is no hash', () => {
    beforeEach(() => {
      statement.get.mockReturnValueOnce({ hash: null });
      vi.mocked(sha256).mockReturnValue('hash');
    });

    it('should generate hash', async () => {
      await GET({ locals });
      expect(vi.mocked(sha256)).toHaveBeenCalledWith('userid');
    });

    it('should inject set statement', async () => {
      await GET({ locals });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.SetUserHashStatement);
    });

    it('should set hash', async () => {
      await GET({ locals });
      expect(statement.run).toHaveBeenCalledWith('hash', 'userid');
    });
  });

  it('should return hash', async () => {
    statement.get.mockReturnValueOnce({ hash: 'hash' });
    const response = await GET({ locals });
    await expect(response.text()).resolves.toBe('hash');
  });
});
