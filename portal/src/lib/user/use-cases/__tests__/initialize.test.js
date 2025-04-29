import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTHENTICATED_ROUTE } from '$lib/constants/authenticated-route.const.js';
import { UNAUTHENTICATED_ROUTE } from '$lib/constants/unauthenticated-route.const.js';
import { createUser } from '../../domain.js';
import { Navigate } from '../../events.js';
import { NetworkService, Store } from '../../injection-tokens.js';
import { initialize } from '../initialize.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../../domain.js');

const networkUser = 'network user';

const networkServiceMock = { getUser: vi.fn() };
const storeMock = { set: vi.fn() };

describe('user / use cases / initialize', () => {
  let createdUser;

  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(networkServiceMock).mockReturnValueOnce(storeMock);
    networkServiceMock.getUser.mockResolvedValueOnce(networkUser);
    createdUser = {
      created: 'user',
      isAuthenticated: Math.random() > 0.5,
    };
    vi.mocked(createUser).mockReturnValueOnce(createdUser);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject network service', async () => {
    await initialize();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(NetworkService);
  });

  it('should get user via network', async () => {
    await initialize();
    expect(networkServiceMock.getUser).toHaveBeenCalled();
  });

  it('should create user', async () => {
    await initialize();
    expect(vi.mocked(createUser)).toHaveBeenCalledWith(networkUser);
  });

  it('should inject user store', async () => {
    await initialize();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Store);
  });

  it('should set user in store', async () => {
    await initialize();
    expect(storeMock.set).toHaveBeenCalledWith(createdUser);
  });

  it('should emit Navigate event', async () => {
    await initialize();
    expect(
      vi.mocked(emit),
    ).toHaveBeenCalledWith(
      Navigate,
      createdUser.isAuthenticated ? AUTHENTICATED_ROUTE : UNAUTHENTICATED_ROUTE,
    );
  });
});
