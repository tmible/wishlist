import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import getNickname from '../get-nickname.js';

describe('getNickname', () => {
  it('should return same nickname for same seed', () => {
    assert.equal(getNickname(13), getNickname(13));
  });
});
