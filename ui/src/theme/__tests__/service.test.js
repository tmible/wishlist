// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initTheme, isDarkTheme, subscribeToTheme, updateTheme } from '../service.js';

const localStorageStub = { getItem: vi.fn(), setItem: vi.fn() };

vi.stubGlobal('localStorage', localStorageStub);
vi.stubGlobal(
  'window',
  {
    matchMedia: vi.fn(() => ({ matches: true })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
);

describe('theme / service', () => {
  let destroyTheme;
  let unsubscriber;

  beforeEach(() => {
    localStorageStub.getItem.mockReturnValue('{}');
    vi.spyOn(document, 'addEventListener');
    vi.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    unsubscriber?.();
    destroyTheme?.();
    vi.clearAllMocks();
  });

  const adjustTheme = (trigger) => {
    it('should get value from localStorage', () => {
      trigger();
      expect(localStorageStub.getItem).toHaveBeenCalledWith('theme');
    });

    it('should check media match', () => {
      trigger();
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should update value for subscribers', () => {
      const handler = vi.fn();
      localStorageStub.getItem.mockReturnValueOnce(JSON.stringify({
        windowPrefersDark: true,
        themeName: 'light',
      }));
      unsubscriber = subscribeToTheme(handler);
      trigger();
      expect(handler).toHaveBeenCalledWith(false);
    });

    describe('if there is no value in local storage', () => {
      beforeEach(() => {
        localStorageStub.getItem.mockReturnValueOnce(JSON.stringify(null));
      });

      it('should update value in localStorage', () => {
        trigger();
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
        trigger();
        expect(document.documentElement.dataset.theme).toBe('dark');
      });

      it('should update value for subscribers', () => {
        const handler = vi.fn();
        unsubscriber = subscribeToTheme(handler);
        vi.mocked(window.matchMedia).mockReturnValueOnce({ matches: false });
        trigger();
        expect(handler).toHaveBeenCalledWith(false);
      });
    });

    describe('if windowPrefersDark does not equal fromWindow', () => {
      beforeEach(() => {
        localStorageStub.getItem.mockReturnValueOnce(JSON.stringify({
          windowPrefersDark: true,
          themeName: 'theme',
        }));
        vi.mocked(window.matchMedia).mockReturnValueOnce({ matches: false });
      });

      it('should update value in localStorage', () => {
        trigger();
        expect(
          localStorageStub.setItem,
        ).toHaveBeenCalledWith(
          'theme',
          JSON.stringify({
            windowPrefersDark: true,
            themeName: 'light',
          }),
        );
      });

      it('should update value in document dataset', () => {
        trigger();
        expect(document.documentElement.dataset.theme).toBe('light');
      });

      it('should update value for subscribers', () => {
        const handler = vi.fn();
        unsubscriber = subscribeToTheme(handler);
        trigger();
        expect(handler).toHaveBeenCalledWith(false);
      });
    });

    describe('if there is no themeName in localStorage', () => {
      beforeEach(() => {
        localStorageStub.getItem.mockReturnValueOnce(JSON.stringify({ windowPrefersDark: false }));
        vi.mocked(window.matchMedia).mockReturnValueOnce({ matches: false });
      });

      it('should update value in localStorage', () => {
        trigger();
        expect(
          localStorageStub.setItem,
        ).toHaveBeenCalledWith(
          'theme',
          JSON.stringify({
            windowPrefersDark: true,
            themeName: 'light',
          }),
        );
      });

      it('should update value in document dataset', () => {
        trigger();
        expect(document.documentElement.dataset.theme).toBe('light');
      });

      it('should update value for subscribers', () => {
        const handler = vi.fn();
        unsubscriber = subscribeToTheme(handler);
        trigger();
        expect(handler).toHaveBeenCalledWith(false);
      });
    });
  };

  describe('initTheme', () => {
    adjustTheme(() => destroyTheme = initTheme());

    it('should add focus event listener', () => {
      destroyTheme = initTheme();
      expect(window.addEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
    });

    it('should add visibilitychange event listener', () => {
      destroyTheme = initTheme();
      expect(
        document.addEventListener,
      ).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function),
      );
    });

    describe('on focus', () => {
      let eventListener;

      beforeEach(() => {
        vi.mocked(
          window.addEventListener,
        ).mockImplementationOnce(
          (event, listener) => eventListener = listener,
        );
        destroyTheme = initTheme();
      });

      adjustTheme(() => eventListener());
    });

    describe('on visibilitychange if document isn\'t hidden', () => {
      let eventListener;

      beforeEach(() => {
        vi.mocked(
          document.addEventListener,
        ).mockImplementationOnce(
          (event, listener) => eventListener = listener,
        );
        destroyTheme = initTheme();
      });

      adjustTheme(() => eventListener());
    });

    describe('on destroy', () => {
      it('should remove focus event listener', () => {
        let eventListener;
        vi.mocked(
          window.addEventListener,
        ).mockImplementationOnce(
          (event, listener) => eventListener = listener,
        );
        initTheme()();
        expect(window.removeEventListener).toHaveBeenCalledWith('focus', eventListener);
      });

      it('should remove visibilitychange event listener', () => {
        let eventListener;
        vi.mocked(
          document.addEventListener,
        ).mockImplementationOnce(
          (event, listener) => eventListener = listener,
        );
        initTheme()();
        expect(
          document.removeEventListener,
        ).toHaveBeenCalledWith(
          'visibilitychange',
          eventListener,
        );
      });
    });
  });

  describe('isDarkTheme', () => {
    it('should return true for dark theme', () => {
      localStorageStub.getItem.mockReturnValueOnce(JSON.stringify({
        windowPrefersDark: true,
        themeName: 'dark',
      }));
      destroyTheme = initTheme();
      expect(isDarkTheme()).toBe(true);
    });

    it('should return false for any other theme', () => {
      localStorageStub.getItem.mockReturnValueOnce(JSON.stringify({
        windowPrefersDark: true,
        themeName: 'theme',
      }));
      destroyTheme = initTheme();
      expect(isDarkTheme()).toBe(false);
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
      expect(document.documentElement.dataset.theme).toBe('light');
    });

    it('should update value for subscribers', () => {
      const handler = vi.fn();
      unsubscriber = subscribeToTheme(handler);
      updateTheme(true);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('should not update value for subscribers if it is the same', () => {
      const handler = vi.fn();
      unsubscriber = subscribeToTheme(handler);
      handler.mockClear();
      updateTheme(true);
      updateTheme(true);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  it('should subscribe to theme', () => {
    const handler = vi.fn();
    unsubscriber = subscribeToTheme(handler);
    handler.mockClear();
    updateTheme(false);
    expect(handler).toHaveBeenCalledWith(false);
  });

  it('should immidiately call subscriber', () => {
    const handler = vi.fn();
    unsubscriber = subscribeToTheme(handler);
    expect(handler).toHaveBeenCalledWith(false);
  });
});
