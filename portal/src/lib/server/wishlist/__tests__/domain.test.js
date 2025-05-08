import { describe, expect, it } from 'vitest';
import { assignOrderToNewItem, markExernallyAddedItem } from '../domain.js';

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

  describe('markExernallyAddedItem', () => {
    it('should mark exernally added item', () => {
      const userid = 'userid';
      const item = {};
      markExernallyAddedItem(item, userid);
      expect(item.addedBy).toBe(userid);
    });
  });
});
