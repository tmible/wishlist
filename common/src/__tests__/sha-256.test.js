import { describe, expect, it } from 'vitest';
import sha256 from '../sha-256.js';

describe('sha256', () => {
  it('should calculate hash', async () => {
    await expect(
      sha256('sha256'),
    ).resolves.toBe(
      '5d5b09f6dcb2d53a5fffc60c4ac0d55fabdf556069d6631545f42aa6e3500f2e',
    );
  });
});
