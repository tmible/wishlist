import { post } from '@tmible/wishlist-common/post';
import { describe, expect, it, vi } from 'vitest';
import { getHash, getUser, logout } from '../network.service.js';

vi.stubGlobal('fetch', vi.fn());
vi.mock('@tmible/wishlist-common/post');

describe('user / network service', () => {
  describe('get user', () => {
    it('should get user', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ json: vi.fn() });
      await getUser();
      expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/user');
    });

    it('should return user', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ json: vi.fn(() => 'user') });
      await expect(getUser()).resolves.toBe('user');
    });
  });

  describe('get hash', () => {
    it('should get hash', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ text: vi.fn() });
      await getHash();
      expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/user/hash');
    });

    it('should return hash', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ text: vi.fn(() => 'hash') });
      await expect(getHash()).resolves.toBe('hash');
    });
  });

  describe('logout', () => {
    it('should logout', async () => {
      await logout();
      expect(vi.mocked(post)).toHaveBeenCalledWith('/api/logout');
    });

    it('should return logout result', async () => {
      vi.mocked(post).mockResolvedValueOnce('logout');
      await expect(logout()).resolves.toBe('logout');
    });
  });
});
