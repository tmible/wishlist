import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initDB } from '$lib/server/db';

const resolve = vi.fn();
vi.mock('$env/dynamic/private', () => ({ env: { HMAC_SECRET: 'HMAC secret' } }));
vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock('jsonwebtoken');
vi.mock('$lib/server/db');

describe('server hooks', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('auth middleware', () => {
    let handle;
    let event;

    beforeEach(async () => {
      event = {
        url: { pathname: '' },
        cookies: { get: () => {} },
      };
      ({ handle } = await import('../hooks.server.js'));
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

    it('should init DB', async () => {
      await import('../hooks.server.js');
      expect(vi.mocked(initDB)).toHaveBeenCalled();
    });
  });
});
