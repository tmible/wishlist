import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTHENTICATED_ROUTE } from '$lib/constants/authenticated-route.const.js';
import { Navigate } from '../../events.js';
import { Store } from '../../injection-tokens.js';
import { login } from '../login.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');

const storeMock = { patch: vi.fn() };

describe('user / use cases / login', () => {
  beforeEach(() => {
    vi.mocked(inject).mockReturnValueOnce(storeMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject user store', () => {
    login();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Store);
  });

  it('should patch user in store', () => {
    login();
    expect(storeMock.patch).toHaveBeenCalledWith({ isAuthenticated: true });
  });

  it('should emit Navigate event', () => {
    login();
    expect(vi.mocked(emit)).toHaveBeenCalledWith(Navigate, AUTHENTICATED_ROUTE);
  });
});
