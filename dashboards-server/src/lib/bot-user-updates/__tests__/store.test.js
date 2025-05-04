import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { botUserUpdates } from '../store.js';

const subscription = vi.fn();

describe('bot user updates / store', () => {
  let unsubscribe;

  beforeEach(() => {
    unsubscribe = botUserUpdates.subscribe(subscription);
  });

  afterEach(() => {
    unsubscribe?.();
    vi.clearAllMocks();
  });

  describe('subscribe', () => {
    it('should immideately invoke subscriber', () => {
      expect(subscription).toHaveBeenCalled();
    });

    it('should unsubscribe', () => {
      subscription.mockClear();
      unsubscribe();
      unsubscribe = undefined;
      botUserUpdates.set({});
      expect(subscription).not.toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('should invoke subscribers on value set', () => {
      const value = { page: 'page', total: 'total', index: 'index' };
      unsubscribe = botUserUpdates.subscribe(subscription);
      botUserUpdates.set(value);
      expect(subscription).toHaveBeenCalledWith(value);
    });
  });
});
