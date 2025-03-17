import { describe, expect, it } from 'vitest';
import { sha256, sha256Raw } from '../sha-256.js';

const hash = '5d5b09f6dcb2d53a5fffc60c4ac0d55fabdf556069d6631545f42aa6e3500f2e';

describe('sha256', () => {
  it('should calculate hash as ArrayBuffer', async () => {
    await expect(
      sha256Raw('sha256').then((buffer) => new Uint8Array(buffer)),
    ).resolves.toEqual(
      new Uint8Array(hash.match(/.{2}/g).map((byte) => Number.parseInt(byte, 16))),
    );
  });

  it('should calculate hash as string', async () => {
    await expect(sha256('sha256')).resolves.toBe(hash);
  });
});
