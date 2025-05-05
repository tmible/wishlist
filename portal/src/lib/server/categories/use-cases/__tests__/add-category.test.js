import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AddCategory } from '../../events.js';
import { addCategory } from '../add-category.js';

vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../../events.js', () => ({ AddCategory: 'add category' }));

describe('categories / use cases / add category', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit AddCategory event', () => {
    addCategory('userid', 'name');
    expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(AddCategory), 'userid', 'name');
  });

  it('should return AddCategory event result', () => {
    vi.mocked(emit).mockReturnValueOnce('category added');
    expect(addCategory()).toBe('category added');
  });
});
