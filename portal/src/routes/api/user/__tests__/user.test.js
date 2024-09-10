import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../+server.js';

vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock('jsonwebtoken');
vi.mock('$env/dynamic/private', () => ({ env: { HMAC_SECRET: 'HMAC secret' } }));

describe('user endpoint', () => {
  let cookies;

  beforeEach(() => {
    cookies = { get: () => {} };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null and false if there is no cookie', async () => {
    expect(await GET({ cookies })).toEqual({ id: null, isAuthenticated: false });
  });

  describe('if there is cookie', () => {
    beforeEach(() => {
      cookies.get = () => 'token';
      vi.spyOn(jwt, 'verify').mockReturnValue({ userid: 'userid' });
    });

    it('should verify it\'s value', async () => {
      await GET({ cookies });
      expect(jwt.verify).toHaveBeenCalledWith('token', 'HMAC secret');
    });

    it('should return null and false if verification fails', async () => {
      vi.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('verification failed');
      });
      expect(await GET({ cookies })).toEqual({ id: null, isAuthenticated: false });
    });

    it('should return userid and true if token is valid', async () => {
      expect(await GET({ cookies })).toEqual({ id: 'userid', isAuthenticated: true });
    });
  });
});
