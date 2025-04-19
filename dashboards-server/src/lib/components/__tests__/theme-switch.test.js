// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ThemeSwitch from '../theme-switch.svelte';

const isDarkTheme = vi.fn();
const updateTheme = vi.fn();
const subscribeToTheme = vi.fn();

vi.mock(
  '@tmible/wishlist-common/dependency-injector',
  () => ({ inject: () => ({ isDarkTheme, updateTheme, subscribeToTheme }) }),
);

describe('theme switch', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('on create', () => {
    it('should check theme', () => {
      render(ThemeSwitch);
      expect(isDarkTheme).toHaveBeenCalled();
    });

    it('should update theme', () => {
      isDarkTheme.mockReturnValue(true);
      render(ThemeSwitch);
      expect(updateTheme).toHaveBeenCalledWith(true);
    });
  });

  describe('on mount', () => {
    it('should subscribe to theme', () => {
      render(ThemeSwitch);
      expect(subscribeToTheme).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('on destroy', () => {
    it('should unsubscribe from theme', () => {
      const unsubscribeFromTheme = vi.fn();
      subscribeToTheme.mockReturnValueOnce(unsubscribeFromTheme);
      render(ThemeSwitch).unmount();
      expect(unsubscribeFromTheme).toHaveBeenCalled();
    });
  });

  it('should toggle theme', async () => {
    isDarkTheme.mockReturnValue(false);
    const user = userEvent.setup();
    render(ThemeSwitch);
    const toggler = screen.getByRole('switch');
    await user.click(toggler);
    expect(updateTheme).toHaveBeenCalledWith(true);
  });
});
