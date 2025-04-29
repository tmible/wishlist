import jwt from 'jsonwebtoken';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { decode } from '../jwt.service.js';

vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock('jsonwebtoken');
vi.mock('$env/dynamic/private', () => ({ env: { HMAC_SECRET: 'HMAC secret' } }));

describe('user / JWT service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should decode JWT', async () => {
    await decode('token');
    expect(jwt.verify).toHaveBeenCalledWith('token', 'HMAC secret');
  });

  it('should return decoded JWT', async () => {
    vi.mocked(jwt.verify).mockReturnValueOnce('decoded');
    await expect(decode('token')).resolves.toBe('decoded');
  });
});
