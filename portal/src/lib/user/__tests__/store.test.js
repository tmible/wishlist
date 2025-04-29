import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { user } from '../store.js';

const subscription = vi.fn();

describe('user / store', () => {
  let unsubscribe;

  beforeEach(() => {
    unsubscribe = user.subscribe(subscription);
  });

  afterEach(() => {
    unsubscribe?.();
    vi.clearAllMocks();
  });

  it('should immideately invoke subscriber', () => {
    expect(subscription).toHaveBeenCalled();
  });

  it('should invoke subscriber on value change', () => {
    user.set({ key: 'value' });
    expect(subscription).toHaveBeenCalledWith({ key: 'value' });
  });

  it('should unsubscribe', () => {
    subscription.mockClear();
    unsubscribe();
    unsubscribe = undefined;
    user.set({ key: 'value' });
    expect(subscription).not.toHaveBeenCalled();
  });

  it('should set and get value', () => {
    user.set({ key: 'value' });
    expect(user.get()).toEqual({ key: 'value' });
  });
});
