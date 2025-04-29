import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GetCategories } from '../../events.js';
import { getCategories } from '../get-categories.js';

vi.mock('@tmible/wishlist-common/event-bus');

describe('categories / use cases / get categories', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit GetCategories event', () => {
    getCategories('userid');
    expect(vi.mocked(emit)).toHaveBeenCalledWith(GetCategories, 'userid');
  });

  it('should return GetCategories event result', () => {
    vi.mocked(emit).mockReturnValueOnce('categories');
    expect(getCategories()).toBe('categories');
  });
});
