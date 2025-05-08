import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { subscribe, unsubscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GetUserHash } from '../events.js';
import { initUserFeature } from '../initialization.js';
import { NetworkService, Store } from '../injection-tokens.js';
import * as networkService from '../network.service.js';
import { user } from '../store.js';
import { getHash } from '../use-cases/get-hash.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../events.js', () => ({ GetUserHash: 'get user hash' }));
vi.mock('../injection-tokens.js', () => ({ NetworkService: 'network service', Store: 'store' }));

describe('user / initialization', () => {
  let destroyUserFeature;

  beforeEach(() => {
    destroyUserFeature = initUserFeature();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide store', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(Store, user);
  });

  it('should provide network service', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(NetworkService, networkService);
  });

  it('should subscribe to GetUserHash event', () => {
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(vi.mocked(GetUserHash), getHash);
  });

  describe('on destroy', () => {
    beforeEach(() => {
      destroyUserFeature();
    });

    it('should deprive store', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(Store));
    });

    it('should deprive network service', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(NetworkService));
    });

    it('should unsubscribe from GetUserHash event', () => {
      expect(vi.mocked(unsubscribe)).toHaveBeenCalledWith(GetUserHash);
    });
  });
});
