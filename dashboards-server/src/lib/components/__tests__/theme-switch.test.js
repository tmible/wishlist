// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ThemeSwitch from '../theme-switch.svelte';

const updateTheme = vi.fn();
const subscribeToTheme = vi.fn();

vi.mock(
  '@tmible/wishlist-common/dependency-injector',
  () => ({ inject: () => ({ updateTheme, subscribeToTheme }) }),
);

describe('theme switch', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
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
    let handler;
    subscribeToTheme.mockImplementationOnce((themeHandler) => handler = themeHandler);
    const user = userEvent.setup();
    render(ThemeSwitch);
    handler(false);
    const toggler = screen.getByRole('checkbox');
    await user.click(toggler);
    expect(updateTheme).toHaveBeenCalledWith(true);
  });
});
