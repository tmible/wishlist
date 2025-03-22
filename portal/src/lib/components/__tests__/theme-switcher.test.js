// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ThemeSwitcher from '../theme-switcher.svelte';

const isDarkTheme = vi.fn();
const updateTheme = vi.fn();

vi.mock(
  '@tmible/wishlist-common/dependency-injector',
  () => ({ inject: () => ({ isDarkTheme, updateTheme }) }),
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

  it('should toggle theme', async () => {
    isDarkTheme.mockReturnValue(false);
    const user = userEvent.setup();
    render(ThemeSwitcher);
    const toggler = screen.getByRole('checkbox');
    await user.click(toggler);
    expect(updateTheme).toHaveBeenCalledWith(true);
  });
});
