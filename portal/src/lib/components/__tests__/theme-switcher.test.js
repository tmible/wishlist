// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ThemeSwitcher from '../theme-switcher.svelte';

const updateTheme = vi.fn();
const subscribeToTheme = vi.fn();

vi.mock(
  '@tmible/wishlist-common/dependency-injector',
  () => ({ inject: () => ({ updateTheme, subscribeToTheme }) }),
);

describe('theme switcher', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
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
    let handler;
    subscribeToTheme.mockImplementationOnce((themeHandler) => handler = themeHandler);
    const user = userEvent.setup();
    render(ThemeSwitcher);
    handler(false);
    const toggler = screen.getByRole('checkbox');
    await user.click(toggler);
    expect(updateTheme).toHaveBeenCalledWith(true);
  });
});
