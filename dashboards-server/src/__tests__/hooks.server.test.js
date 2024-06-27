import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handle } from '../hooks.server.js';

const resolve = vi.fn();
vi.mock('$env/static/private', () => ({ HMAC_SECRET: 'HMAC secret' }));
vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock('jsonwebtoken', () => ({ default: { verify: vi.fn() } }));

describe('auth middleware', () => {
  let event;

  beforeEach(() => {
    event = {
      url: { pathname: '' },
      cookies: { get: () => {} },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('if pathname starts with /api/data', () => {
    beforeEach(() => {
      event.url.pathname = '/api/data/';
    });

    it('should fail if there is no cookie', async () => {
      expect(await handle({ event, resolve })).toEqual(new Response(null, { status: 401 }));
    });

    describe('if there is cookie', () => {
      beforeEach(() => {
        event.cookies.get = () => 'token';
      });

      it('should verify it\'s value', async () => {
        await handle({ event, resolve });
        expect(jwt.verify).toHaveBeenCalledWith('token', 'HMAC secret');
      });

      it('should fail if verification fails', async () => {
        jwt.verify = () => {
          throw new Error('verification failed');
        };
        expect(await handle({ event, resolve })).toEqual(new Response(null, { status: 401 }));
      });
    });
  });

  const resolveTestCases = [{
    condition: 'pathname doesn\'t start with /api/data/',
    setUp: () => {},
  }, {
    condition: 'token is valid',
    setUp: () => {
      event.url.path = '/api/data';
    },
  }];

  for (const { condition, setUp } of resolveTestCases) {
    it(`should resolve if ${condition}`, async () => {
      setUp();
      await handle({ event, resolve });
      expect(resolve).toHaveBeenCalledWith(event);
    });
  }
});
