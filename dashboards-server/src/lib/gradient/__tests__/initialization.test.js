import { deprive, provide } from '@tmible/wishlist-common/dependency-injector';
import { subscribe, unsubscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as cssService from '../css.service.js';
import { ApplyGradient, RemoveGradient } from '../events.js';
import * as faviconService from '../favicon.service.js';
import { initGradientFeature } from '../initialization.js';
import { GradientStore, NextGradientStore } from '../injection-tokens.js';
import { nextStore, store } from '../store.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../css.service.js');
vi.mock(
  '../events.js',
  () => ({ ApplyGradient: 'apply gradient', RemoveGradient: 'remove gradient' }),
);
vi.mock('../favicon.service.js');
vi.mock(
  '../injection-tokens.js',
  () => ({ GradientStore: 'gradient store', NextGradientStore: 'next gradient store' }),
);

describe('gradient / initialization', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide gradient store', () => {
    initGradientFeature();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(vi.mocked(GradientStore), store);
  });

  it('should provide next gradient store', () => {
    initGradientFeature();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(vi.mocked(NextGradientStore), nextStore);
  });

  it('should subscribe to ApplyGradient event', () => {
    initGradientFeature();
    expect(
      vi.mocked(subscribe),
    ).toHaveBeenCalledWith(
      vi.mocked(ApplyGradient),
      expect.any(Function),
    );
  });

  describe('ApplyGradient event', () => {
    let eventHandler;

    beforeEach(() => {
      subscribe.mockImplementation((event, handler) => {
        if (event === vi.mocked(ApplyGradient)) {
          eventHandler = handler;
        }
      });
      initGradientFeature();
    });

    it('should invoke CSS service on ApplyGradient event', () => {
      eventHandler('gradient');
      expect(vi.mocked(cssService.applyGradient)).toHaveBeenCalledWith('gradient');
    });

    it('should invoke favicon service on ApplyGradient event', () => {
      eventHandler('gradient');
      expect(vi.mocked(faviconService.applyGradient)).toHaveBeenCalledWith('gradient');
    });
  });

  it('should subscribe to RemoveGradient event', () => {
    initGradientFeature();
    expect(
      vi.mocked(subscribe),
    ).toHaveBeenCalledWith(
      vi.mocked(RemoveGradient),
      expect.any(Function),
    );
  });

  describe('RemoveGradient event', () => {
    let eventHandler;

    beforeEach(() => {
      subscribe.mockImplementation((event, handler) => {
        if (event === vi.mocked(RemoveGradient)) {
          eventHandler = handler;
        }
      });
      initGradientFeature();
    });

    it('should invoke CSS service on RemoveGradient event', () => {
      eventHandler('gradient');
      expect(vi.mocked(cssService.removeGradient)).toHaveBeenCalledWith('gradient');
    });

    it('should invoke favicon service on RemoveGradient event', () => {
      eventHandler('gradient');
      expect(vi.mocked(faviconService.removeGradient)).toHaveBeenCalledWith('gradient');
    });
  });

  describe('on destroy', () => {
    beforeEach(() => {
      initGradientFeature()();
    });

    it('should unsubscribe from ApplyGradient event', () => {
      expect(vi.mocked(unsubscribe)).toHaveBeenCalledWith(vi.mocked(ApplyGradient));
    });

    it('should unsubscribe from RemoveGradient event', () => {
      expect(vi.mocked(unsubscribe)).toHaveBeenCalledWith(vi.mocked(RemoveGradient));
    });

    it('should deprive gradient store', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(GradientStore));
    });

    it('should deprive next gradient store', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(vi.mocked(NextGradientStore));
    });
  });
});
