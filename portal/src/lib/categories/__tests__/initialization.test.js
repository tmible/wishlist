import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initCategoriesFeature } from '../initialization.js';
import { NetworkService, Store } from '../injection-tokens.js';
import * as networkService from '../network.service.js';
import { categories } from '../store.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../injection-tokens.js', () => ({ NetworkService: 'network service', Store: 'store' }));

describe('categories / initialization', () => {
  let destroyCategoriesFeature;

  beforeEach(() => {
    destroyCategoriesFeature = initCategoriesFeature();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide store', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(Store, categories);
  });

  it('should provide network service', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(NetworkService, networkService);
  });

  describe('on destroy', () => {
    beforeEach(() => {
      destroyCategoriesFeature();
    });

    it('should deprive store', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(Store));
    });

    it('should deprive network service', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(NetworkService));
    });
  });
});
