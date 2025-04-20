import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextStore, store } from '../store.js';

describe('gradient / store', () => {
  describe('main store', () => {
    it('should get value', () => {
      vi.stubGlobal(
        'localStorage',
        { getItem: vi.fn().mockReturnValueOnce('{ "from": "local storage" }') },
      );
      expect(store.get()).toEqual({ from: 'local storage' });
    });

    it('should set value', () => {
      vi.stubGlobal('localStorage', { setItem: vi.fn() });
      store.set({ to: 'local storage' });
      expect(
        vi.mocked(localStorage.setItem),
      ).toHaveBeenCalledWith(
        'gradient',
        '{"to":"local storage"}',
      );
    });

    it('should delete value', () => {
      vi.stubGlobal('localStorage', { removeItem: vi.fn() });
      store.delete();
      expect(vi.mocked(localStorage.removeItem)).toHaveBeenCalled();
    });
  });

  describe('next store', () => {
    let unsubscribe;

    beforeEach(() => {
      unsubscribe = undefined;
    });

    afterEach(() => {
      unsubscribe?.();
      nextStore.delete();
    });

    it('should unsubscribe from value', () => {
      const subscriber = vi.fn();
      const randomValue = Math.random();
      unsubscribe = nextStore.subscribe(subscriber);
      subscriber.mockClear();
      unsubscribe();
      nextStore.set(randomValue);
      expect(subscriber).not.toHaveBeenCalled();
    });

    it('should get initial value', () => {
      expect(nextStore.get()).toBe(undefined);
    });

    it('should set value', () => {
      const randomValue = Math.random();
      nextStore.set(randomValue);
      expect(nextStore.get()).toBe(randomValue);
    });

    it('should notify subscribers on value set', () => {
      const subscriber = vi.fn();
      const randomValue = Math.random();
      unsubscribe = nextStore.subscribe(subscriber);
      nextStore.set(randomValue);
      expect(subscriber).toHaveBeenCalledWith(randomValue);
    });

    it('should delete value', () => {
      nextStore.set('gradient');
      nextStore.delete();
      expect(nextStore.get()).toBe(undefined);
    });

    it('should notify subscribers on value delete', () => {
      const subscriber = vi.fn();
      const randomValue = Math.random();
      nextStore.set(randomValue);
      unsubscribe = nextStore.subscribe(subscriber);
      nextStore.delete();
      expect(subscriber).toHaveBeenCalledWith(undefined);
    });
  });
});
