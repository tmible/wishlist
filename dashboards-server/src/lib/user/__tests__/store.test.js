import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { user } from '../store.js';

const subscription = vi.fn();

describe('user / store', () => {
  let unsubscribe;

  beforeEach(() => {
    unsubscribe = user.subscribe(subscription);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should immideately invoke subscriber', () => {
    expect(subscription).toHaveBeenCalled();
    unsubscribe();
  });

  it('should invoke subscriber on value change', () => {
    user.patch({ key: 'value' });
    expect(subscription).toHaveBeenCalledWith(expect.objectContaining({ key: 'value' }));
    unsubscribe();
  });

  it('should unsubscribe', () => {
    subscription.mockClear();
    unsubscribe();
    user.patch({ key: 'value' });
    expect(subscription).not.toHaveBeenCalled();
  });
});
