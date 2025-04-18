// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ThemeSwitch from '../theme-switch.svelte';

const isDarkTheme = vi.fn();
const updateTheme = vi.fn();

vi.mock(
  '@tmible/wishlist-common/dependency-injector',
  () => ({ inject: () => ({ isDarkTheme, updateTheme }) }),
);

describe('theme switcher', () => {
  afterEach(() => {
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

  it('should toggle theme', async () => {
    isDarkTheme.mockReturnValue(false);
    const user = userEvent.setup();
    render(ThemeSwitch);
    const toggler = screen.getByRole('switch');
    await user.click(toggler);
    expect(updateTheme).toHaveBeenCalledWith(true);
  });
});
