import { post } from '@tmible/wishlist-common/post';
import { describe, expect, it, vi } from 'vitest';
import { checkAuthentication, logout } from '../network.service.js';

vi.stubGlobal('fetch', vi.fn());
vi.mock('@tmible/wishlist-common/post');

describe('user / network service', () => {
  describe('check authentication', () => {
    it('should check authentication', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ json: vi.fn() });
      await checkAuthentication();
      expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/isAuthenticated');
    });

    it('should return authentication', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ json: vi.fn(() => 'authentication') });
      await expect(checkAuthentication()).resolves.toBe('authentication');
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
