import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import digitToEmoji from '../digit-to-emoji.js';

describe('digitToEmoji', () => {
  it('should convert digit to appropriate emoji', () => {
    assert.equal(digitToEmoji(3), '3⃣');
  });

  it('should convert 10 to appropriate emoji', () => {
    assert.equal(digitToEmoji(10), '🔟');
  });

  it('should convert number, containing more than 1 digit, to appropriate emojis', () => {
    assert.equal(digitToEmoji(13), '1⃣3⃣');
  });
});
