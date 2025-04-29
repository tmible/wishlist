import arrayToOrderedJSON from '@tmible/wishlist-common/array-to-ordered-json';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { assignOrderToNewItem, patchItem } from '../domain.js';

vi.mock('@tmible/wishlist-common/array-to-ordered-json');

describe('wishlist / domain', () => {
  describe('assignOrderToNewItem', () => {
    it('should assign order', () => {
      const length = Math.random();
      const list = { length };
      const item = {};
      assignOrderToNewItem(list, item);
      expect(item.order).toBe(length);
    });
  });

  describe('patchItem', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should use arrayToOrderedJSON for description entities', () => {
      patchItem(
        { descriptionEntities: [ 'modified description entities' ] },
        { descriptionEntities: [ 'original description entities' ] },
      );
      expect(
        vi.mocked(arrayToOrderedJSON),
      ).toHaveBeenCalledWith(
        [ 'modified description entities' ],
      );
      expect(
        vi.mocked(arrayToOrderedJSON),
      ).toHaveBeenCalledWith(
        [ 'original description entities' ],
      );
    });

    it('should filter description entities out', () => {
      vi.mocked(arrayToOrderedJSON).mockReturnValue('same thing');
      expect(
        patchItem(
          { descriptionEntities: 'original description entities' },
          { descriptionEntities: 'modified description entities' },
        ),
      ).toEqual(
        [ false, { descriptionEntities: 'original description entities' }, {} ],
      );
    });

    it('should not filter description entities out', () => {
      vi.mocked(arrayToOrderedJSON)
        .mockReturnValueOnce('one thing')
        .mockReturnValueOnce('other thing');
      expect(
        patchItem(
          { descriptionEntities: 'original description entities' },
          { descriptionEntities: 'modified description entities' },
        ),
      ).toEqual([
        true,
        { descriptionEntities: 'modified description entities' },
        { descriptionEntities: 'modified description entities' },
      ]);
    });

    it('should filter category out if it is the same', () => {
      expect(
        patchItem({ category: { id: 'id' } }, { category: { id: 'id' } }),
      ).toEqual(
        [ false, { category: { id: 'id' } }, {} ],
      );
    });

    it(
      'should filter category out if there is none neither in edited item nor in original one',
      () => {
        expect(
          patchItem({ category: null }, { category: null }),
        ).toEqual(
          [ false, { category: null }, {} ],
        );
      },
    );

    it('should not filter category out if there is none in edited item', () => {
      expect(
        patchItem({ category: null }, { category: { id: 'id' } }),
      ).toEqual(
        [ true, { category: { id: 'id' } }, { category: { id: 'id' } } ],
      );
    });

    it('should not filter category out if there is none in stored item', () => {
      expect(
        patchItem({ category: { id: 'id' } }, { category: null }),
      ).toEqual(
        [ true, { category: null }, { category: null } ],
      );
    });

    it('should filter out other matching properties', () => {
      expect(
        patchItem(
          { original: 'original', unchanged: 'unchanged', changed: 'unchanged' },
          { unchanged: 'unchanged', changed: 'changed' },
        ),
      ).toEqual([
        true,
        { original: 'original', unchanged: 'unchanged', changed: 'changed' },
        { changed: 'changed' },
      ]);
    });

    it('should return false, original object and epmty patch if nothing is modified', () => {
      expect(
        patchItem({ original: 'original' }, {}),
      ).toEqual(
        [ false, { original: 'original' }, {} ],
      );
    });
  });
});
