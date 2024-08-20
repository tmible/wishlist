import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import numericEnum from '../numeric-enum.js';

describe('numericEnum', () => {
  it('should create enum', () => {
    assert.deepEqual(numericEnum([ 'key1', 'key2' ]), { key1: 0, key2: 1 });
  });
});
