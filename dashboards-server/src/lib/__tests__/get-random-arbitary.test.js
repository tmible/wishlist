import { describe, expect, it } from 'vitest';
import { getRandomArbitrary } from '../get-random-arbitrary.js';

describe('getRandomArbitrary', () => {
  it('should return number in range', () => {
    const min = Math.random() * 100;
    const max = min + (Math.random() * 100);
    const random = getRandomArbitrary(min, max);
    expect(random >= min && random < max);
  });
});
