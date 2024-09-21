// @vitest-environment jsdom
import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.stubGlobal('fetch', vi.fn().mockResolvedValue());

describe('store/categories', () => {
  let categories;

  beforeEach(async () => {
    ({ categories } = await import('../categories.js'));
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should set default value', () => {
    expect(get(categories)).toBeNull();
  });

  describe('on subscribe', () => {
    let unsubscribe;

    afterEach(() => {
      unsubscribe();
    });

    it('should not fetch if already has value', () => {
      categories.set('value');
      unsubscribe = categories.subscribe(() => {});
      vi.advanceTimersToNextTimer();
      expect(vi.mocked(fetch)).not.toHaveBeenCalled();
    });

    it('should set timeout to fetch', () => {
      vi.stubGlobal('setTimeout', vi.fn());
      unsubscribe = categories.subscribe(() => {});
      expect(vi.mocked(setTimeout)).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should fetch initially', () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce('value'),
      });
      unsubscribe = categories.subscribe(() => {});
      vi.advanceTimersToNextTimer();
      expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/wishlist/categories');
    });

    it('should set fetched on timeout value', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce('value'),
      });
      unsubscribe = categories.subscribe(() => {});
      await vi.advanceTimersToNextTimerAsync();
      expect(get(categories)).toBe('value');
    });
  });

  it('should clear all timers on unsubscribe', () => {
    categories.subscribe(() => {})();
    expect(vi.getTimerCount()).toBe(0);
  });
});
