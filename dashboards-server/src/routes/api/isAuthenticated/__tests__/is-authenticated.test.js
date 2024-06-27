import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../+server.js';

vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock('jsonwebtoken', () => ({ default: { verify: vi.fn() } }));
vi.mock('$env/static/private', () => ({ HMAC_SECRET: 'HMAC secret' }));

describe('isAuthenticated endpoint', () => {
  let cookies;

  beforeEach(() => {
    cookies = { get: () => {} };
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should return false if there is no cookie', async () => {
    expect(await GET({ cookies })).toEqual(false);
  });

  describe('if there is cookie', () => {
    beforeEach(() => {
      cookies.get = () => 'token';
    });

    it('should verify it\'s value', async () => {
      await GET({ cookies });
      expect(jwt.verify).toHaveBeenCalledWith('token', 'HMAC secret');
    });

    it('should return false if verification fails', async () => {
      vi.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('verification failed');
      });
      expect(await GET({ cookies })).toEqual(false);
    });

    it('should return true if token is valid', async () => {
      expect(await GET({ cookies })).toEqual(true);
    });
  });
});
