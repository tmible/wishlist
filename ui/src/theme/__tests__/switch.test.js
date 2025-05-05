// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { subscribeToTheme, updateTheme } from '../service.js';
import ThemeSwitch from '../switch.svelte';

vi.mock('../service.js');

describe('theme / switch', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('on mount', () => {
    it('should subscribe to theme', () => {
      render(ThemeSwitch);
      expect(vi.mocked(subscribeToTheme)).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('on destroy', () => {
    it('should unsubscribe from theme', () => {
      const unsubscribeFromTheme = vi.fn();
      vi.mocked(subscribeToTheme).mockReturnValueOnce(unsubscribeFromTheme);
      render(ThemeSwitch).unmount();
      expect(unsubscribeFromTheme).toHaveBeenCalled();
    });
  });

  it('should toggle theme', async () => {
    let handler;
    vi.mocked(subscribeToTheme).mockImplementationOnce((themeHandler) => handler = themeHandler);
    const user = userEvent.setup();
    render(ThemeSwitch);
    handler(false);
    const toggler = screen.getByRole('checkbox');
    await user.click(toggler);
    expect(vi.mocked(updateTheme)).toHaveBeenCalledWith(true);
  });
});
