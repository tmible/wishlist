import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { subscribe, unsubscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { Navigate } from '../events.js';
import { initUserFeature } from '../initialization.js';
import { NetworkService, Store } from '../injection-tokens.js';
import * as networkService from '../network.service.js';
import { user } from '../store.js';

const pageMock = { url: { pathname: '' } };

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$app/navigation');
vi.mock(
  '$app/state',
  () => ({
    get page() {
      return pageMock;
    },
  }),
);
vi.mock('../events.js', () => ({ Navigate: 'navigate' }));
vi.mock('../injection-tokens.js', () => ({ Store: 'store', NetworkService: 'network service' }));

describe('user / initialization', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide store', () => {
    initUserFeature();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(vi.mocked(Store), user);
  });

  it('should provide network service', () => {
    initUserFeature();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(vi.mocked(NetworkService), networkService);
  });

  it('should subscribe to Navigate event', () => {
    initUserFeature();
    expect(vi.mocked(subscribe)).toHaveBeenCalledWith(vi.mocked(Navigate), expect.any(Function));
  });

  describe('Navigate event', () => {
    let eventHandler;

    beforeEach(() => {
      vi.mocked(subscribe).mockImplementation((event, handler) => eventHandler = handler);
      initUserFeature();
    });

    it('should not navigate to current page or subpage', () => {
      eventHandler('');
      expect(vi.mocked(goto)).not.toHaveBeenCalled();
    });

    it('should not navigate to current page or subpage', () => {
      eventHandler('route');
      expect(vi.mocked(goto)).toHaveBeenCalledWith('route');
    });
  });

  describe('on destroy', () => {
    beforeEach(() => {
      initUserFeature()();
    });

    it('should deprive store', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(Store));
    });

    it('should deprive network service', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(NetworkService));
    });

    it('should unsubscribe from Navigate event', () => {
      expect(vi.mocked(unsubscribe)).toHaveBeenCalledWith(vi.mocked(Navigate));
    });
  });
});
