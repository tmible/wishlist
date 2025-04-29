import { describe, expect, it } from 'vitest';
import { isCategoryEdited } from '../domain.js';

describe('categories / domain', () => {
  describe('isCategoryEdited', () => {
    it('should return false for different categories', () => {
      expect(isCategoryEdited({ id: 1, name: 'name 1' }, { id: 2, name: 'name 2' })).toBe(false);
    });

    it('should return false for same variants', () => {
      expect(isCategoryEdited({ id: 1, name: 'name' }, { id: 1, name: 'name' })).toBe(false);
    });

    it('should return true for different variants', () => {
      expect(isCategoryEdited({ id: 1, name: 'name 1' }, { id: 1, name: 'name 2' })).toBe(true);
    });
  });
});
