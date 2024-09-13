// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { adjustGradient, generateGradient } from '$lib/gradient-generator';
import GradientSwitcher from '../gradient-switcher.svelte';

const localStorageStub = { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() };

vi.stubGlobal('localStorage', localStorageStub);
vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('$lib/gradient-generator', () => ({ adjustGradient: vi.fn(), generateGradient: vi.fn() }));

describe('gradient switcher', () => {
  let documentStyleSpy;
  let subscribeToTheme;

  beforeEach(() => {
    documentStyleSpy = vi.spyOn(document.documentElement.style, 'setProperty');
    adjustGradient.mockReturnValue({ style: 'style' });
    generateGradient.mockReturnValue({ style: 'style' });
    subscribeToTheme = vi.fn();
    vi.mocked(inject).mockReturnValue({ isDarkTheme: vi.fn(), subscribeToTheme });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('on create', () => {
    it('should check gradient', () => {
      render(GradientSwitcher);
      expect(localStorageStub.getItem).toHaveBeenCalledWith('gradient');
    });

    describe('if gradient is active', () => {
      beforeEach(() => {
        localStorageStub.getItem.mockReturnValue('{"style": "style"}');
        render(GradientSwitcher);
      });

      it('should add gradient to local storage', () => {
        expect(localStorageStub.setItem).toHaveBeenCalledWith('gradient', '{"style":"style"}');
      });

      it('should add gradient to css variables', () => {
        expect(documentStyleSpy).toHaveBeenCalledWith('--gradient', 'style');
      });
    });

    describe('if gradient is not active', () => {
      beforeEach(() => {
        render(GradientSwitcher);
      });

      it('should generate new gradient', () => {
        expect(generateGradient).toHaveBeenCalled();
      });

      it('should remove gradient from local storage', () => {
        expect(localStorageStub.removeItem).toHaveBeenCalledWith('gradient');
      });

      it('should remove gradient from css variables', () => {
        expect(documentStyleSpy).toHaveBeenCalledWith('--gradient', undefined);
      });
    });
  });

  it('should subscribe to theme on mount', () => {
    render(GradientSwitcher);
    expect(subscribeToTheme).toHaveBeenCalled();
  });

  describe('on theme change', () => {
    let themeChangeHandler;
    let isDark;

    beforeEach(() => {
      subscribeToTheme.mockImplementation((handler) => themeChangeHandler = handler);
      isDark = Math.random() >= 0.5;
    });

    it('should adjust gradient', () => {
      render(GradientSwitcher);
      themeChangeHandler(isDark);
      expect(adjustGradient).toHaveBeenCalledWith({ style: 'style' }, isDark);
    });

    describe('if gradient is active', () => {
      let unmount;

      beforeEach(() => {
        localStorageStub.getItem.mockReturnValue('{"style": "style"}');
        ({ unmount } = render(GradientSwitcher));
        themeChangeHandler(isDark);
      });

      afterEach(() => {
        unmount();
      });

      it('should add gradient to local storage', () => {
        expect(localStorageStub.setItem).toHaveBeenCalledWith('gradient', '{"style":"style"}');
      });

      it('should add gradient to css variables', () => {
        expect(documentStyleSpy).toHaveBeenCalledWith('--gradient', 'style');
      });
    });
  });

  describe('on toggle', () => {
    describe('if gradient is active', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        render(GradientSwitcher);
        const toggler = screen.getByRole('switch');
        await user.click(toggler);
      });

      it('should add gradient to local storage', () => {
        expect(localStorageStub.setItem).toHaveBeenCalledWith('gradient', '{"style":"style"}');
      });

      it('should add gradient to css variables', () => {
        expect(documentStyleSpy).toHaveBeenCalledWith('--gradient', 'style');
      });
    });

    describe('if gradient is not active', () => {
      beforeEach(async () => {
        localStorageStub.getItem.mockReturnValue('{"style": "style"}');
        const user = userEvent.setup();
        render(GradientSwitcher);
        const toggler = screen.getByRole('switch');
        await user.click(toggler);
      });

      it('should generate gradient', () => {
        expect(generateGradient).toHaveBeenCalled();
      });

      it('should remove gradient from local storage', () => {
        expect(localStorageStub.removeItem).toHaveBeenCalledWith('gradient');
      });

      it('should remove gradient from css variables', () => {
        expect(documentStyleSpy).toHaveBeenCalledWith('--gradient', undefined);
      });
    });
  });
});
