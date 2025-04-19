// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ThemeSwitcher from '../theme-switcher.svelte';

const isDarkTheme = vi.fn();
const updateTheme = vi.fn();
const subscribeToTheme = vi.fn();

vi.mock(
  '@tmible/wishlist-common/dependency-injector',
  () => ({ inject: () => ({ isDarkTheme, updateTheme, subscribeToTheme }) }),
);

describe('theme switcher', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  describe('on create', () => {
    it('should check theme', () => {
      isDarkTheme.mockReturnValue(true);
      render(ThemeSwitcher);
      expect(isDarkTheme).toHaveBeenCalled();
    });

    it('should update theme', () => {
      isDarkTheme.mockReturnValue(true);
      render(ThemeSwitcher);
      expect(updateTheme).toHaveBeenCalledWith(true);
    });
  });

  describe('on mount', () => {
    it('should subscribe to theme', () => {
      render(ThemeSwitcher);
      expect(subscribeToTheme).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('on destroy', () => {
    it('should unsubscribe from theme', () => {
      const unsubscribeFromTheme = vi.fn();
      subscribeToTheme.mockReturnValueOnce(unsubscribeFromTheme);
      render(ThemeSwitcher).unmount();
      expect(unsubscribeFromTheme).toHaveBeenCalled();
    });
  });

  it('should toggle theme', async () => {
    isDarkTheme.mockReturnValue(false);
    const user = userEvent.setup();
    render(ThemeSwitcher);
    const toggler = screen.getByRole('checkbox');
    await user.click(toggler);
    expect(updateTheme).toHaveBeenCalledWith(true);
  });
});
