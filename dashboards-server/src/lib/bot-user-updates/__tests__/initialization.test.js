import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cache } from '../cache.js';
import { initBotUserUpdatesFeature } from '../initialization.js';
import { Cache, NetworkService, Store } from '../injection-tokens.js';
import * as networkService from '../network.service.js';
import { botUserUpdates } from '../store.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

describe('bot user updates / initialization', () => {
  let destroyBotUserUpdatesFeature;

  beforeEach(() => {
    destroyBotUserUpdatesFeature = initBotUserUpdatesFeature();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide store', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(Store, botUserUpdates);
  });

  it('should provide network service', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(NetworkService, networkService);
  });

  it('should provide cache', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(Cache, cache);
  });

  describe('on destroy', () => {
    beforeEach(() => {
      destroyBotUserUpdatesFeature();
    });

    it('should deprive store', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(Store);
    });

    it('should deprive network service', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(NetworkService);
    });

    it('should deprive cache', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(Cache);
    });
  });
});
