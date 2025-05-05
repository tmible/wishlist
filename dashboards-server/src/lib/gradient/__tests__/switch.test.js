// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { ThemeService } from '@tmible/wishlist-ui/theme/injection-tokens';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as cssService from '../css.service.js';
import { GradientVariant } from '../domain.js';
import { initGradientFeature } from '../initialization.js';
import { nextStore, store } from '../store.js';
import GradientSwitch from '../switch.svelte';
import { adjustGradient } from '../use-cases/adjust-gradient.js';
import { removeGradient } from '../use-cases/remove-gradient.js';
import { setGradient } from '../use-cases/set-gradient.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-ui/theme/injection-tokens', () => ({ ThemeService: 'theme service' }));
vi.mock('../css.service.js');
vi.mock('../initialization.js');
vi.mock(
  '../store.js',
  () => ({
    store: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
    nextStore: writable(null),
  }),
);
vi.mock('../use-cases/adjust-gradient.js');
vi.mock('../use-cases/remove-gradient.js');
vi.mock('../use-cases/set-gradient.js');

describe('gradient / switch', () => {
  let themeService;

  beforeEach(() => {
    themeService = { isDarkTheme: vi.fn(), subscribeToTheme: vi.fn() };
    vi.mocked(inject).mockReturnValueOnce(themeService);
    vi.mocked(initGradientFeature).mockReturnValue(vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('on create', () => {
    it('should inject theme service', () => {
      render(GradientSwitch);
      expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(ThemeService));
    });

    it('should get gradient from store', () => {
      render(GradientSwitch);
      expect(vi.mocked(store.get)).toHaveBeenCalled();
    });

    it('should init gradient feature', () => {
      render(GradientSwitch);
      expect(vi.mocked(initGradientFeature)).toHaveBeenCalled();
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
    it('should unsubscribe from theme', () => {
      const themeUnsubscriber = vi.fn();
      themeService.subscribeToTheme.mockReturnValueOnce(themeUnsubscriber);
      render(GradientSwitch).unmount();
      expect(themeUnsubscriber).toHaveBeenCalled();
    });

    it('should destroy gradient feature', () => {
      const destroyGradientFeature = vi.fn();
      vi.mocked(initGradientFeature).mockReturnValueOnce(destroyGradientFeature);
      render(GradientSwitch).unmount();
      expect(destroyGradientFeature).toHaveBeenCalled();
    });
  });

  it('should construct style for switch background', async () => {
    vi.mocked(nextStore).set('next gradient');
    const user = userEvent.setup();
    render(GradientSwitch);
    const toggler = screen.getByRole('checkbox');
    await user.click(toggler);
    await user.click(toggler);
    expect(vi.mocked(cssService.constructStyle)).toHaveBeenCalledWith('next gradient');
  });

  it('should remove gradient for light theme on switch toggle', async () => {
    themeService.isDarkTheme.mockReturnValue(false);
    const user = userEvent.setup();
    render(GradientSwitch);
    const toggler = screen.getByRole('checkbox');
    await user.click(toggler);
    await user.click(toggler);
    expect(vi.mocked(removeGradient)).toHaveBeenCalledWith(GradientVariant.LIGHT);
  });

  it('should remove gradient for dark theme on switch toggle', async () => {
    themeService.isDarkTheme.mockReturnValue(true);
    const user = userEvent.setup();
    render(GradientSwitch);
    const toggler = screen.getByRole('checkbox');
    await user.click(toggler);
    await user.click(toggler);
    expect(vi.mocked(removeGradient)).toHaveBeenCalledWith(GradientVariant.DARK);
  });

  it('should set gradient on switch toggle', async () => {
    const user = userEvent.setup();
    render(GradientSwitch);
    const toggler = screen.getByRole('checkbox');
    await user.click(toggler);
    expect(vi.mocked(setGradient)).toHaveBeenCalled();
  });
});
