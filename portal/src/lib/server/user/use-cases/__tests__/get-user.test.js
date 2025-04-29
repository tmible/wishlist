import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getUser } from '../get-user.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

const cookies = { get: vi.fn() };
const jwtServiceMock = { decode: vi.fn() };

describe('user / use cases / get user', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return null and false if there is no cookie', async () => {
    await expect(getUser(cookies)).resolves.toEqual({ id: null, isAuthenticated: false });
  });

  describe('if there is cookie', () => {
    beforeEach(() => {
      cookies.get = () => 'token';
      vi.mocked(inject).mockReturnValueOnce(jwtServiceMock);
    });

    it('should decode it\'s value', async () => {
      jwtServiceMock.decode.mockResolvedValueOnce({ userid: 'userid' });
      await getUser(cookies);
      expect(jwtServiceMock.decode).toHaveBeenCalledWith('token');
    });

    it('should return null and false if verification fails', async () => {
      jwtServiceMock.decode.mockImplementationOnce(
        () => Promise.reject(new Error('verification failed')),
      );
      await expect(getUser(cookies)).resolves.toEqual({ id: null, isAuthenticated: false });
    });

    it('should return userid and true if token is valid', async () => {
      jwtServiceMock.decode.mockResolvedValueOnce({ userid: 'userid' });
      await expect(getUser(cookies)).resolves.toEqual({ id: 'userid', isAuthenticated: true });
    });
  });
});
