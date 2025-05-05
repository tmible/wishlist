import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GetWishlist } from '../../events.js';
import { getWishlist } from '../get-wishlist.js';

vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../../events.js', () => ({ GetWishlist: 'get wishlist' }));

describe('wishlist / use cases / get wishlist', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit GetWishlist event', () => {
    getWishlist('userid');
    expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(GetWishlist), 'userid');
  });

  it('should return wishlist', () => {
    vi.mocked(emit).mockReturnValueOnce('wishlist');
    expect(getWishlist('userid')).toBe('wishlist');
  });
});
