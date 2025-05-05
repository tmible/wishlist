import { emit } from '@tmible/wishlist-common/event-bus';
import sha256 from '@tmible/wishlist-common/sha-256';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GetUserHash, SetUserHash } from '../../events.js';
import { getUserHash } from '../get-user-hash.js';

vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('@tmible/wishlist-common/sha-256');
vi.mock('../../events.js', () => ({ GetUserHash: 'get user hash', SetUserHash: 'set user hash' }));

describe('user / use cases / get user hash', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit GetUserHash event', async () => {
    await getUserHash('userid');
    expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(GetUserHash), 'userid');
  });

  describe('if there is no hash', () => {
    beforeEach(() => {
      vi.mocked(emit).mockReturnValueOnce(null);
      vi.mocked(sha256).mockReturnValue('hash');
    });

    it('should generate hash', async () => {
      await getUserHash('userid');
      expect(vi.mocked(sha256)).toHaveBeenCalledWith('userid');
    });

    it('should set hash', async () => {
      await getUserHash('userid');
      expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(SetUserHash), 'hash', 'userid');
    });
  });

  it('should return hash', async () => {
    vi.mocked(emit).mockReturnValueOnce('hash');
    await expect(getUserHash()).resolves.toBe('hash');
  });
});
