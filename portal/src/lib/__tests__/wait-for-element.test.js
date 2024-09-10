// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitForElement } from '../wait-for-element.js';

describe('waitForElement', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve if element is present', async () => {
    vi.spyOn(document, 'querySelector').mockReturnValue('element');
    await expect(waitForElement()).resolves.toBe('element');
  });

  describe('if element isn\'t present', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.stubGlobal('setTimeout', vi.fn(() => 'timeout'));
      vi.spyOn(document, 'querySelector').mockReturnValueOnce(null);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should set rejection timeout', () => {
      waitForElement();
      expect(vi.mocked(setTimeout)).toHaveBeenCalledWith(expect.any(Function), 10000);
    });

    it('should create observer', () => {
      vi.stubGlobal('MutationObserver', vi.fn(() => ({ observe: vi.fn() })));
      waitForElement();
      expect(MutationObserver.prototype.constructor).toHaveBeenCalled();
    });

    it('should observe', () => {
      const observe = vi.fn();
      vi.stubGlobal('MutationObserver', vi.fn(() => ({ observe })));
      waitForElement();
      expect(observe).toHaveBeenCalledWith(document.body, { childList: true, subtree: true });
    });

    describe('on element appearance', () => {
      let observer;
      let disconnect;
      let promise;

      beforeEach(() => {
        disconnect = vi.fn();
        vi.stubGlobal('MutationObserver', vi.fn((...args) => {
          [ observer ] = args;
          return { observe: vi.fn(), disconnect };
        }));
        vi.stubGlobal('clearTimeout', vi.fn());
        promise = waitForElement();
        vi.mocked(document.querySelector).mockReturnValue('element');
        observer();
      });

      afterEach(() => {
        vi.mocked(document.querySelector).mockReset();
      });

      it('should clear timeout', () => {
        expect(vi.mocked(clearTimeout)).toHaveBeenCalledWith('timeout');
      });

      it('should stop observing', () => {
        expect(disconnect).toHaveBeenCalled();
      });

      it('should resolve', async () => {
        await expect(promise).resolves.toBe('element');
      });
    });

    it('should reject after 10 seconds', async () => {
      // restore setTimeout implementation
      vi.useRealTimers();
      vi.useFakeTimers();
      const promise = waitForElement();
      vi.advanceTimersByTime(10000);
      await expect(promise).rejects.toThrowError();
    });
  });
});
