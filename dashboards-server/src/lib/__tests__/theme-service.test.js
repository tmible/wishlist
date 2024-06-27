// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const localStorageStub = { getItem: vi.fn(), setItem: vi.fn() };

vi.stubGlobal('localStorage', localStorageStub);
vi.stubGlobal('window', { matchMedia: vi.fn() });

describe('theme service', () => {
  beforeEach(() => {
    localStorageStub.getItem.mockReturnValue('theme from localStorage');
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('isDarkTheme', () => {
    it('should return true for dark theme', async () => {
      localStorageStub.getItem.mockReturnValue('dark');
      const { isDarkTheme } = await import('../theme-service.js');
      expect(isDarkTheme()).toEqual(true);
    });

    it('should return false for any other theme', async () => {
      const { isDarkTheme } = await import('../theme-service.js');
      expect(isDarkTheme()).toEqual(false);
    });
  });

  describe('updateTheme', () => {
    it('should update value in localStorage', async () => {
      const { updateTheme } = await import('../theme-service.js');
      updateTheme(true);
      expect(localStorageStub.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should update value in document dataset', async () => {
      const { updateTheme } = await import('../theme-service.js');
      updateTheme(false);
      expect(document.documentElement.dataset.theme).toEqual('light');
    });

    it('should update value for subscribers', async () => {
      const { subscribeToTheme, updateTheme } = await import('../theme-service.js');
      const handler = vi.fn();
      subscribeToTheme(handler);
      updateTheme(true);
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  it('should subscribe to theme', async () => {
    const { subscribeToTheme, updateTheme } = await import('../theme-service.js');
    const handler = vi.fn();
    subscribeToTheme(handler);
    updateTheme(true);
    expect(handler).toHaveBeenCalledWith(true);
  });
});
