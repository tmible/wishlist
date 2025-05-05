import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initWishlistFeature } from '../initialization.js';
import { LinkService, NetworkService, Store } from '../injection-tokens.js';
import * as linkService from '../link.service.js';
import * as networkService from '../network.service.js';
import { wishlist } from '../store.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock(
  '../injection-tokens.js',
  () => ({ LinkService: 'link service', NetworkService: 'network service', Store: 'store' }),
);

describe('wishlist / initialization', () => {
  let destroyWishlistFeature;

  beforeEach(() => {
    destroyWishlistFeature = initWishlistFeature();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide store', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(Store, wishlist);
  });

  it('should provide network service', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(NetworkService, networkService);
  });

  it('should provide link service', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(LinkService, linkService);
  });

  describe('on destroy', () => {
    beforeEach(() => {
      destroyWishlistFeature();
    });

    it('should deprive store', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(Store));
    });

    it('should deprive network service', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(NetworkService));
    });

    it('should deprive link service', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(LinkService));
    });
  });
});
