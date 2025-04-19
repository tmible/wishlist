// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { deprive, inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { subscribe, unsubscribe } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeService } from '$lib/theme-service-injection-token.js';
import * as cssService from '../css.service.js';
import { GradientVariant } from '../domain.js';
import { ApplyGradient, RemoveGradient } from '../events.js';
import * as faviconService from '../favicon.service.js';
import { GradientStore, NextGradientStore } from '../injection-tokens.js';
import { nextStore, store } from '../store.js';
import GradientSwitch from '../switch.svelte';
import { adjustGradient } from '../use-cases/adjust-gradient.js';
import { removeGradient } from '../use-cases/remove-gradient.js';
import { setGradient } from '../use-cases/set-gradient.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../css.service.js');
vi.mock('../favicon.service.js');
vi.mock('../store.js');
vi.mock('../use-cases/adjust-gradient.js');
vi.mock('../use-cases/remove-gradient.js');
vi.mock('../use-cases/set-gradient.js');

describe('gradient / switch', () => {
  let themeService;

  beforeEach(() => {
    themeService = { isDarkTheme: vi.fn(), subscribeToTheme: vi.fn() };
    vi.mocked(inject).mockReturnValueOnce(themeService);
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  describe('on create', () => {
    it('should inject theme service', () => {
      render(GradientSwitch);
      expect(vi.mocked(inject)).toHaveBeenCalledWith(ThemeService);
    });

    it('should get gradient from store', () => {
      render(GradientSwitch);
      expect(vi.mocked(store.get)).toHaveBeenCalled();
    });

    it('should get next gradient from store', () => {
      render(GradientSwitch);
      expect(vi.mocked(nextStore.get)).toHaveBeenCalled();
    });

    it('should provide gradient store', () => {
      render(GradientSwitch);
      expect(vi.mocked(provide)).toHaveBeenCalledWith(GradientStore, store);
    });

    it('should provide next gradient store', () => {
      render(GradientSwitch);
      expect(vi.mocked(provide)).toHaveBeenCalledWith(NextGradientStore, nextStore);
    });

    it('should subscribe to ApplyGradient event', () => {
      render(GradientSwitch);
      expect(vi.mocked(subscribe)).toHaveBeenCalledWith(ApplyGradient, expect.any(Function));
    });

    describe('ApplyGradient event', () => {
      let eventHandler;

      beforeEach(() => {
        subscribe.mockImplementation((event, handler) => {
          if (event === ApplyGradient) {
            eventHandler = handler;
          }
        });
        render(GradientSwitch);
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
      render(GradientSwitch);
      expect(vi.mocked(subscribe)).toHaveBeenCalledWith(RemoveGradient, expect.any(Function));
    });

    describe('RemoveGradient event', () => {
      let eventHandler;

      beforeEach(() => {
        subscribe.mockImplementation((event, handler) => {
          if (event === RemoveGradient) {
            eventHandler = handler;
          }
        });
        render(GradientSwitch);
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
  });

  describe('on mount', () => {
    it('should subscribe to theme', () => {
      render(GradientSwitch);
      expect(themeService.subscribeToTheme).toHaveBeenCalledWith(expect.any(Function));
    });

    describe('on theme change', () => {
      let themeSubscriber;

      beforeEach(() => {
        themeService.subscribeToTheme.mockImplementation(
          (subscriber) => themeSubscriber = subscriber,
        );
        render(GradientSwitch);
      });

      it('should adjust gradient to light theme', () => {
        themeSubscriber(false);
        expect(vi.mocked(adjustGradient)).toHaveBeenCalledWith(GradientVariant.LIGHT);
      });

      it('should adjust gradient to dark theme', () => {
        themeSubscriber(true);
        expect(vi.mocked(adjustGradient)).toHaveBeenCalledWith(GradientVariant.DARK);
      });
    });
  });

  describe('on destory', () => {
    beforeEach(() => {
      const { unmount } = render(GradientSwitch);
      unmount();
    });

    it('should deprive gradient store', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(GradientStore);
    });

    it('should deprive next gradient store', () => {
      expect(vi.mocked(deprive)).toHaveBeenCalledWith(NextGradientStore);
    });

    it('should unsubscribe from ApplyGradient event', () => {
      expect(vi.mocked(unsubscribe)).toHaveBeenCalledWith(ApplyGradient);
    });

    it('should unsubscribe from RemoveGradient event', () => {
      expect(vi.mocked(unsubscribe)).toHaveBeenCalledWith(RemoveGradient);
    });
  });

  it('should construct style for switch background', async () => {
    vi.mocked(nextStore.get).mockReturnValue('next gradient');
    const user = userEvent.setup();
    render(GradientSwitch);
    const toggler = screen.getByRole('switch');
    await user.click(toggler);
    await user.click(toggler);
    expect(vi.mocked(cssService.constructStyle)).toHaveBeenCalledWith('next gradient');
  });

  it('should remove gradient for light theme on switch toggle', async () => {
    themeService.isDarkTheme.mockReturnValue(false);
    const user = userEvent.setup();
    render(GradientSwitch);
    const toggler = screen.getByRole('switch');
    await user.click(toggler);
    await user.click(toggler);
    expect(vi.mocked(removeGradient)).toHaveBeenCalledWith(GradientVariant.LIGHT);
  });

  it('should remove gradient for dark theme on switch toggle', async () => {
    themeService.isDarkTheme.mockReturnValue(true);
    const user = userEvent.setup();
    render(GradientSwitch);
    const toggler = screen.getByRole('switch');
    await user.click(toggler);
    await user.click(toggler);
    expect(vi.mocked(removeGradient)).toHaveBeenCalledWith(GradientVariant.DARK);
  });

  it('should set gradient on switch toggle', async () => {
    const user = userEvent.setup();
    render(GradientSwitch);
    const toggler = screen.getByRole('switch');
    await user.click(toggler);
    expect(vi.mocked(setGradient)).toHaveBeenCalled();
  });
});
