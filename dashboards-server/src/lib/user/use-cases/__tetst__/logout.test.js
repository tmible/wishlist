import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UNAUTHENTICATED_ROUTE } from '$lib/constants/unauthenticated-route.const.js';
import { Navigate } from '../../events.js';
import { NetworkService, Store } from '../../injection-tokens.js';
import { logout } from '../logout.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

const networkServiceMock = { logout: vi.fn() };
const storeMock = { patch: vi.fn() };

const runGeneralTests = () => {
  it('should inject user store', () => {
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Store);
  });

  it('should patch user in store', () => {
    expect(storeMock.patch).toHaveBeenCalledWith({ isAuthenticated: false });
  });

  it('should emit Navigate event', () => {
    expect(vi.mocked(emit)).toHaveBeenCalledWith(Navigate, UNAUTHENTICATED_ROUTE);
  });
};

describe('user / use cases / logout', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('without shouldSendRequest parameter', () => {
    beforeEach(async () => {
      vi.mocked(inject).mockReturnValueOnce(storeMock);
      await logout();
    });

    runGeneralTests();
  });

  describe('with shouldSendRequest = false parameter', () => {
    beforeEach(async () => {
      vi.mocked(inject).mockReturnValueOnce(storeMock);
      await logout(false);
    });

    runGeneralTests();
  });

  describe('with shouldSendRequest = true parameter', () => {
    beforeEach(() => {
      vi.mocked(inject).mockReturnValueOnce(networkServiceMock).mockReturnValueOnce(storeMock);
      networkServiceMock.logout.mockResolvedValue({});
    });

    it('should inject user network service', async () => {
      await logout(true);
      expect(vi.mocked(inject)).toHaveBeenCalledWith(NetworkService);
    });

    it('should logout via network', async () => {
      await logout(true);
      expect(networkServiceMock.logout).toHaveBeenCalled();
    });

    describe('on network success', () => {
      beforeEach(async () => {
        networkServiceMock.logout.mockResolvedValueOnce({ ok: true });
        await logout(true);
      });

      runGeneralTests();
    });
  });
});
