import { describe, expect, it, vi } from 'vitest';
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
    it('should get initial value', () => {
      expect(nextStore.get()).toBe(undefined);
    });

    it('should set value', () => {
      nextStore.set('gradient');
      expect(nextStore.get()).toBe('gradient');
    });

    it('should delete value', () => {
      nextStore.set('gradient');
      nextStore.delete();
      expect(nextStore.get()).toBe(undefined);
    });
  });
});
