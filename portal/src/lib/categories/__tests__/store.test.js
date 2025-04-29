import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initCategories } from '$lib/categories/use-cases/init-categories.js';
import { categories } from '../store.js';

vi.mock('$lib/categories/use-cases/init-categories.js');

const subscription = vi.fn();

describe('categories / store', () => {
  let unsubscribe;

  beforeEach(() => {
    categories.set([]);
  });

  afterEach(() => {
    unsubscribe?.();
    vi.clearAllMocks();
  });

  describe('subscribe', () => {
    beforeEach(() => {
      unsubscribe = categories.subscribe(subscription);
    });

    it('should immideately invoke subscriber', () => {
      expect(subscription).toHaveBeenCalled();
    });

    it('should init categories if there is one subscriber', () => {
      expect(vi.mocked(initCategories)).toHaveBeenCalled();
    });

    it('should unsubscribe', () => {
      subscription.mockClear();
      unsubscribe();
      unsubscribe = undefined;
      categories.set();
      expect(subscription).not.toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('should set value', () => {
      categories.set('categories');
      expect(categories.get()).toEqual('categories');
    });

    it('should invoke subscribers on value set', () => {
      unsubscribe = categories.subscribe(subscription);
      categories.set('categories');
      expect(subscription).toHaveBeenCalledWith('categories');
    });
  });

  describe('add', () => {
    it('should push to value', () => {
      categories.add('category');
      expect(categories.get()).toEqual([ 'category' ]);
    });

    it('should invoke subscribers on value push', () => {
      unsubscribe = categories.subscribe(subscription);
      categories.add('category');
      expect(subscription).toHaveBeenCalledWith([ 'category' ]);
    });
  });

  describe('update', () => {
    describe('if there is such category in store', () => {
      beforeEach(() => {
        categories.set([{ id: 1, name: 'name 1' }]);
      });

      it('should update value', () => {
        categories.update({ id: 1, name: 'name 2' });
        expect(categories.get()).toEqual([{ id: 1, name: 'name 2' }]);
      });

      it('should invoke subscribers on value update', () => {
        unsubscribe = categories.subscribe(subscription);
        categories.update({ id: 1, name: 'name 2' });
        expect(subscription).toHaveBeenCalledWith([{ id: 1, name: 'name 2' }]);
      });
    });
  });

  describe('delete', () => {
    describe('if there is such category in store', () => {
      beforeEach(() => {
        categories.set([{ id: 1 }]);
      });

      it('should delete from value', () => {
        categories.delete({ id: 1 });
        expect(categories.get()).toEqual([]);
      });

      it('should invoke subscribers on value update', () => {
        unsubscribe = categories.subscribe(subscription);
        categories.delete({ id: 1 });
        expect(subscription).toHaveBeenCalledWith([]);
      });
    });
  });
});
