import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logoutUser } from '../../domain.js';
import { NetworkService, Store } from '../../injection-tokens.js';
import { logout } from '../logout.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../../domain.js');
vi.mock('../../injection-tokens.js', () => ({ NetworkService: 'network service', Store: 'store' }));

const networkServiceMock = { logout: vi.fn() };
const storeMock = { get: vi.fn(), set: vi.fn() };

describe('user / use cases / logout', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(networkServiceMock);
    networkServiceMock.logout.mockResolvedValue({ ok: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject user network service', async () => {
    await logout();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(NetworkService));
  });

  it('should logout via network', async () => {
    await logout();
    expect(networkServiceMock.logout).toHaveBeenCalled();
  });

  describe('on network success', () => {
    beforeEach(async () => {
      vi.mocked(inject).mockReturnValueOnce(storeMock);
      networkServiceMock.logout.mockResolvedValueOnce({ ok: true });
      storeMock.get.mockReturnValueOnce('user from store');
      vi.mocked(logoutUser).mockReturnValueOnce('logged out user');
      await logout();
    });

    it('should inject user store', () => {
      expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Store));
    });

    it('should get user from store', () => {
      expect(storeMock.get).toHaveBeenCalled();
    });

    it('should log user out', () => {
      expect(vi.mocked(logoutUser)).toHaveBeenCalledWith('user from store');
    });

    it('should set user in store', () => {
      expect(storeMock.set).toHaveBeenCalledWith('logged out user');
    });
  });
});
