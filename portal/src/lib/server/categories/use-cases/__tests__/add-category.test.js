import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AddCategory } from '../../events.js';
import { addCategory } from '../add-category.js';

vi.mock('@tmible/wishlist-common/event-bus');

describe('categories / use cases / add category', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit AddCategory event', () => {
    addCategory('userid', 'name');
    expect(vi.mocked(emit)).toHaveBeenCalledWith(AddCategory, 'userid', 'name');
  });

  it('should return AddCategory event result', () => {
    vi.mocked(emit).mockReturnValueOnce('category added');
    expect(addCategory()).toBe('category added');
  });
});
