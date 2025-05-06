import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authInterceptor } from '$lib/auth-interceptor.js';
import { addOtherService } from '../domain.js';
import { health } from '../store.js';

vi.stubGlobal('fetch', vi.fn().mockResolvedValue());
vi.mock('$lib/auth-interceptor.js');
vi.mock('../domain.js');
vi.mocked(authInterceptor).mockResolvedValue({ json: vi.fn() });
vi.mocked(addOtherService).mockImplementation((original) => original);

describe('health / store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should set default values', () => {
    expect(
      get(health),
    ).toEqual({
      date: null,
      bot: null,
      portal: null,
      hub: null,
      refreshTokensCleaner: null,
      other: null,
    });
  });

  describe('on subscribe', () => {
    let unsubscribe;

    afterEach(() => {
      unsubscribe();
    });

    it('should set timeout to fetch', () => {
      vi.stubGlobal('setTimeout', vi.fn());
      unsubscribe = health.subscribe(() => {});
      expect(vi.mocked(setTimeout)).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should fetch initially', () => {
      unsubscribe = health.subscribe(() => {});
      vi.advanceTimersToNextTimer();
      expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/data/health');
    });

    it('should set fetched on timeout value', async () => {
      vi.mocked(authInterceptor).mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce('value'),
      });
      unsubscribe = health.subscribe(() => {});
      await vi.advanceTimersToNextTimerAsync();
      expect(get(health)).toBe('value');
    });

    it('should set interval to fetch', () => {
      vi.stubGlobal('setInterval', vi.fn());
      unsubscribe = health.subscribe(() => {});
      expect(vi.mocked(setInterval)).toHaveBeenCalledWith(expect.any(Function), 60 * 1000);
    });

    it('should fetch on interval', () => {
      unsubscribe = health.subscribe(() => {});
      vi.advanceTimersToNextTimer();
      vi.advanceTimersToNextTimer();
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
    });

    it('should set fetched on interval value', async () => {
      vi.mocked(authInterceptor).mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce('value 1'),
      });
      vi.mocked(authInterceptor).mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce('value 2'),
      });
      unsubscribe = health.subscribe(() => {});
      await vi.advanceTimersToNextTimerAsync();
      await vi.advanceTimersToNextTimerAsync();
      expect(get(health)).toBe('value 2');
    });
  });

  it('should clear all timers on unsubscribe', () => {
    health.subscribe(() => {})();
    expect(vi.getTimerCount()).toBe(0);
  });
});
