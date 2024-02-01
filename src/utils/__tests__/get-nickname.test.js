import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { faker } from '@faker-js/faker/locale/ru';
import getNickname from '../get-nickname.js';

describe('getNickname', () => {
  it('should return same nickname for same seed', () => {
    assert.equal(getNickname(13), getNickname(13));
  });
});
