import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTHENTICATED_ROUTE } from '$lib/constants/authenticated-route.const.js';
import { UNAUTHENTICATED_ROUTE } from '$lib/constants/unauthenticated-route.const.js';
import { Navigate } from '../../events.js';
import { NetworkService, Store } from '../../injection-tokens.js';
import { checkAuthentication } from '../check-authentication.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

const networkServiceMock = { checkAuthentication: vi.fn() };
const storeMock = { patch: vi.fn() };

describe('user / use cases / check authentication', () => {
  let isAuthenticated;

  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(networkServiceMock).mockReturnValueOnce(storeMock);
    isAuthenticated = Math.random() >= 0.5;
    networkServiceMock.checkAuthentication.mockResolvedValueOnce(isAuthenticated);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject network service', async () => {
    await checkAuthentication();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(NetworkService);
  });

  it('should check authentication via network', async () => {
    await checkAuthentication();
    expect(networkServiceMock.checkAuthentication).toHaveBeenCalled();
  });

  it('should inject user store', async () => {
    await checkAuthentication();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Store);
  });

  it('should patch user in store', async () => {
    await checkAuthentication();
    expect(storeMock.patch).toHaveBeenCalledWith({ isAuthenticated });
  });

  it('should emit Navigate event', async () => {
    await checkAuthentication();
    expect(
      vi.mocked(emit),
    ).toHaveBeenCalledWith(
      Navigate,
      isAuthenticated ? AUTHENTICATED_ROUTE : UNAUTHENTICATED_ROUTE,
    );
  });
});
