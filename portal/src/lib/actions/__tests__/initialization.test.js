import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initActionsFeature } from '../initialization.js';
import { NetworkService } from '../injection-tokens.js';
import * as networkService from '../network.service.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('../injection-tokens.js', () => ({ NetworkService: 'network service' }));

describe('actions / initialization', () => {
  let destroyActionsFeature;

  beforeEach(() => {
    destroyActionsFeature = initActionsFeature();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide network service', () => {
    expect(vi.mocked(provide)).toHaveBeenCalledWith(NetworkService, networkService);
  });

  describe('on destroy', () => {
    beforeEach(() => {
      destroyActionsFeature();
    });

    it('should deprive network service', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(NetworkService));
    });
  });
});
