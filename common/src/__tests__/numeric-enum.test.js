import { describe, expect, it } from 'vitest';
import numericEnum from '../numeric-enum.js';

describe('numericEnum', () => {
  it('should create enum', () => {
    expect(numericEnum([ 'key1', 'key2' ])).toEqual({ key1: 0, key2: 1 });
  });
});
