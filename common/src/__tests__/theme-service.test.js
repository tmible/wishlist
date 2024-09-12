// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initTheme, isDarkTheme, subscribeToTheme, updateTheme } from '../theme-service.js';

const localStorageStub = { getItem: vi.fn(), setItem: vi.fn() };

vi.stubGlobal('localStorage', localStorageStub);
vi.stubGlobal('window', { matchMedia: vi.fn(() => ({ matches: true })) });

describe('theme service', () => {
  beforeEach(() => {
    localStorageStub.getItem.mockReturnValue('theme from localStorage');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initTheme', () => {
    it('should get value from localStorage', () => {
      localStorageStub.getItem.mockReturnValue('{}');
      initTheme();
      expect(localStorageStub.getItem).toHaveBeenCalledWith('theme');
    });

    it('should check media match', () => {
      localStorageStub.getItem.mockReturnValue('{}');
      initTheme();
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should update value for subscribers', () => {
      const handler = vi.fn();
      localStorageStub.getItem.mockReturnValue(JSON.stringify({
        windowPrefersDark: true,
        themeName: 'dark',
      }));
      subscribeToTheme(handler);
      initTheme();
      expect(handler).toHaveBeenCalledWith(true);
    });

    describe('if there is no value in local storage', () => {
      beforeEach(() => {
        localStorageStub.getItem.mockReturnValue(JSON.stringify(null));
      });

      it('should update value in localStorage', () => {
        initTheme();
        expect(
          localStorageStub.setItem,
        ).toHaveBeenCalledWith(
          'theme',
          JSON.stringify({
            windowPrefersDark: true,
            themeName: 'dark',
          }),
        );
      });

      it('should update value in document dataset', () => {
        initTheme();
        expect(document.documentElement.dataset.theme).toEqual('dark');
      });

      it('should update value for subscribers', () => {
        const handler = vi.fn();
        subscribeToTheme(handler);
        initTheme();
        expect(handler).toHaveBeenCalledWith(true);
      });
    });

    describe('if windowPrefersDark does not equal fromWindow', () => {
      beforeEach(() => {
        localStorageStub.getItem.mockReturnValue(JSON.stringify({
          windowPrefersDark: false,
          themeName: 'theme',
        }));
      });

      it('should update value in localStorage', () => {
        initTheme();
        expect(
          localStorageStub.setItem,
        ).toHaveBeenCalledWith(
          'theme',
          JSON.stringify({
            windowPrefersDark: true,
            themeName: 'dark',
          }),
        );
      });

      it('should update value in document dataset', () => {
        initTheme();
        expect(document.documentElement.dataset.theme).toEqual('dark');
      });

      it('should update value for subscribers', () => {
        const handler = vi.fn();
        subscribeToTheme(handler);
        initTheme();
        expect(handler).toHaveBeenCalledWith(true);
      });
    });

    describe('if there is no themeName in localStorage', () => {
      beforeEach(() => {
        localStorageStub.getItem.mockReturnValue(JSON.stringify({ windowPrefersDark: true }));
      });

      it('should update value in localStorage', () => {
        initTheme();
        expect(
          localStorageStub.setItem,
        ).toHaveBeenCalledWith(
          'theme',
          JSON.stringify({
            windowPrefersDark: true,
            themeName: 'dark',
          }),
        );
      });

      it('should update value in document dataset', () => {
        initTheme();
        expect(document.documentElement.dataset.theme).toEqual('dark');
      });

      it('should update value for subscribers', () => {
        const handler = vi.fn();
        subscribeToTheme(handler);
        initTheme();
        expect(handler).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('isDarkTheme', () => {
    it('should return true for dark theme', () => {
      localStorageStub.getItem.mockReturnValue(JSON.stringify({
        windowPrefersDark: true,
        themeName: 'dark',
      }));
      initTheme();
      expect(isDarkTheme()).toEqual(true);
    });

    it('should return false for any other theme', () => {
      localStorageStub.getItem.mockReturnValue(JSON.stringify({
        windowPrefersDark: true,
        themeName: 'theme',
      }));
      initTheme();
      expect(isDarkTheme()).toEqual(false);
    });
  });

  describe('updateTheme', () => {
    it('should update value in localStorage', () => {
      updateTheme(true);
      expect(
        localStorageStub.setItem,
      ).toHaveBeenCalledWith(
        'theme',
        JSON.stringify({
          windowPrefersDark: true,
          themeName: 'dark',
        }),
      );
    });

    it('should update value in document dataset', () => {
      updateTheme(false);
      expect(document.documentElement.dataset.theme).toEqual('light');
    });

    it('should update value for subscribers', () => {
      const handler = vi.fn();
      subscribeToTheme(handler);
      updateTheme(true);
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  it('should subscribe to theme', () => {
    const handler = vi.fn();
    subscribeToTheme(handler);
    updateTheme(true);
    expect(handler).toHaveBeenCalledWith(true);
  });
});
