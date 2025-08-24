// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AccentPicker from '../accent-picker.svelte';
import { subscribeToTheme, updateTheme } from '../service.js';

vi.mock('../service.js');

// excluded in vitest.config.js. Aparently cannot import .svelte files from bits-ui
describe('theme / accent picker', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('on mount', () => {
    it('should subscribe to theme', () => {
      render(AccentPicker, { accents: [] });
      expect(vi.mocked(subscribeToTheme)).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('on destroy', () => {
    it('should unsubscribe from theme', () => {
      const unsubscribeFromTheme = vi.fn();
      vi.mocked(subscribeToTheme).mockReturnValueOnce(unsubscribeFromTheme);
      render(AccentPicker, { accents: [] }).unmount();
      expect(unsubscribeFromTheme).toHaveBeenCalled();
    });
  });

  it('should pick theme accent', async () => {
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
    render(
      AccentPicker,
      {
        accents: [
          { id: 'accent-1', name: 'accent-1', color: 'accent-1' },
          { id: 'accent-2', name: 'accent-2', color: 'accent-2' },
        ],
      },
    );
    handler({ accent: 'accent-1' });
    const trigger = screen.getByRole('button');
    await user.click(trigger);
    const option = screen.getByText('accent-2');
    await user.click(option);
    expect(vi.mocked(updateTheme)).toHaveBeenCalledWith({ accent: 'accent-2' });
  });
});
