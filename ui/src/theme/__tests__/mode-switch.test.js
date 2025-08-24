// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ModeSwitch from '../mode-switch.svelte';
import { subscribeToTheme, updateTheme } from '../service.js';

vi.mock('../service.js');

describe('theme / mode switch', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('on mount', () => {
    it('should subscribe to theme', () => {
      render(ModeSwitch);
      expect(vi.mocked(subscribeToTheme)).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('on destroy', () => {
    it('should unsubscribe from theme', () => {
      const unsubscribeFromTheme = vi.fn();
      vi.mocked(subscribeToTheme).mockReturnValueOnce(unsubscribeFromTheme);
      render(ModeSwitch).unmount();
      expect(unsubscribeFromTheme).toHaveBeenCalled();
    });
  });

  it('should toggle theme mode', async () => {
    let handler;
    vi.mocked(
      subscribeToTheme,
    ).mockImplementationOnce(
      (themeHandler) => {
        handler = themeHandler;
        return () => {};
      },
    );
    const user = userEvent.setup();
    render(ModeSwitch);
    handler({ isDark: false });
    const toggler = screen.getByRole('checkbox');
    await user.click(toggler);
    expect(vi.mocked(updateTheme)).toHaveBeenCalledWith({ isDark: true });
  });
});
