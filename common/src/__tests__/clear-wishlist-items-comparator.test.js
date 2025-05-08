import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import clearWishlistItemsComparator from '../clear-wishlist-items-comparator.js';
import ListItemState from '../constants/list-item-state.const.js';

describe('clear wishlist items comparator', () => {
  it('should compare by externality', () => {
    assert.equal(clearWishlistItemsComparator({ isExternal: 0 }, { isExternal: 1 }), 1);
  });

  it('should compare free and cooperative', () => {
    assert.equal(
      clearWishlistItemsComparator(
        { isExternal: 0, state: ListItemState.FREE },
        { isExternal: 0, state: ListItemState.COOPERATIVE },
      ),
      1,
    );
  });

  it('should compare free and booked', () => {
    assert.equal(
      clearWishlistItemsComparator(
        { isExternal: 0, state: ListItemState.FREE },
        { isExternal: 0, state: ListItemState.BOOKED },
      ),
      1,
    );
  });

  it('should compare by id', () => {
    assert.equal(
      clearWishlistItemsComparator(
        { isExternal: 0, state: ListItemState.BOOKED, id: 1 },
        { isExternal: 0, state: ListItemState.COOPERATIVE, id: 2 },
      ),
      -1,
    );
  });
});
