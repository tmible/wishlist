import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { wishlist } from '../store.js';

const subscription = vi.fn();

describe('wishlist / store', () => {
  let unsubscribe;

  beforeEach(() => {
    wishlist.set(null);
  });

  afterEach(() => {
    unsubscribe?.();
    vi.clearAllMocks();
  });

  describe('subscribe', () => {
    beforeEach(() => {
      unsubscribe = wishlist.subscribe(subscription);
    });

    it('should immideately invoke subscriber', () => {
      expect(subscription).toHaveBeenCalled();
    });

    it('should unsubscribe', () => {
      subscription.mockClear();
      unsubscribe();
      unsubscribe = undefined;
      wishlist.set();
      expect(subscription).not.toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('should set value', () => {
      wishlist.set('wishlist');
      expect(wishlist.get()).toEqual('wishlist');
    });

    it('should invoke subscribers on value set', () => {
      unsubscribe = wishlist.subscribe(subscription);
      wishlist.set('wishlist');
      expect(subscription).toHaveBeenCalledWith('wishlist');
    });
  });

  describe('add', () => {
    it('should push to null value', () => {
      wishlist.add('item');
      expect(wishlist.get()).toEqual([ 'item' ]);
    });

    it('should push to value', () => {
      wishlist.set([]);
      wishlist.add('item');
      expect(wishlist.get()).toEqual([ 'item' ]);
    });

    it('should invoke subscribers on value push', () => {
      unsubscribe = wishlist.subscribe(subscription);
      wishlist.add('item');
      expect(subscription).toHaveBeenCalledWith([ 'item' ]);
    });
  });

  describe('update', () => {
    describe('if there is such item in store', () => {
      beforeEach(() => {
        wishlist.set([{ id: 1, name: 'name 1' }]);
      });

      it('should update value', () => {
        wishlist.update({ id: 1, name: 'name 2' });
        expect(wishlist.get()).toEqual([{ id: 1, name: 'name 2' }]);
      });

      it('should invoke subscribers on value update', () => {
        unsubscribe = wishlist.subscribe(subscription);
        wishlist.update({ id: 1, name: 'name 2' });
        expect(subscription).toHaveBeenCalledWith([{ id: 1, name: 'name 2' }]);
      });
    });
  });

  describe('delete', () => {
    describe('if there is at least one of items in store', () => {
      beforeEach(() => {
        wishlist.set([{ id: 1 }, { id: 2 }]);
      });

      it('should delete from value', () => {
        wishlist.delete([ 1, 3 ]);
        expect(wishlist.get()).toEqual([{ id: 2 }]);
      });

      it('should invoke subscribers on value update', () => {
        unsubscribe = wishlist.subscribe(subscription);
        wishlist.delete([ 1, 3 ]);
        expect(subscription).toHaveBeenCalledWith([{ id: 2 }]);
      });
    });
  });

  describe('reorder', () => {
    describe('if there is value in store', () => {
      beforeEach(() => {
        wishlist.set([{ id: 1, order: 'order' }, { id: 2 }, { id: 3 }]);
      });

      it('should reorder items', () => {
        wishlist.reorder([{ id: 2, order: 2 }, { id: 3, order: 1 }]);
        expect(
          wishlist.get(),
        ).toEqual(
          [{ id: 1, order: 'order' }, { id: 3, order: 1 }, { id: 2, order: 2 }],
        );
      });

      it('should invoke subscribers on value update', () => {
        unsubscribe = wishlist.subscribe(subscription);
        wishlist.reorder([{ id: 2, order: 2 }, { id: 3, order: 1 }]);
        expect(
          subscription,
        ).toHaveBeenCalledWith(
          [{ id: 1, order: 'order' }, { id: 3, order: 1 }, { id: 2, order: 2 }],
        );
      });
    });
  });
});
