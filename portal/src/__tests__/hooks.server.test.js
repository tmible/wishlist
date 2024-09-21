import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initDB } from '$lib/server/db';
import { connectToIPCHub } from '$lib/server/ipc-hub-connection';

const resolve = vi.fn();
vi.mock('$env/dynamic/private', () => ({ env: { HMAC_SECRET: 'HMAC secret' } }));
vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock('jsonwebtoken');
vi.mock('$lib/server/db');
vi.mock('$lib/server/ipc-hub-connection');

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
        locals: {},
      };
      ({ handle } = await import('../hooks.server.js'));
    });

    describe('if pathname starts with /api/wishlist', () => {
      beforeEach(() => {
        event.url.pathname = '/api/wishlist/';
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
          vi.mocked(jwt.verify).mockImplementation(() => {
            throw new Error('verification failed');
          });
          expect(await handle({ event, resolve })).toEqual(new Response(null, { status: 401 }));
        });
      });
    });

    const resolveTestCases = [{
      condition: 'pathname doesn\'t start with /api/wishlist/',
      setUp: () => {},
    }, {
      condition: 'token is valid',
      setUp: () => {
        event.url.path = '/api/wishlist';
      },
    }];

    for (const { condition, setUp } of resolveTestCases) {
      it(`should resolve if ${condition}`, async () => {
        setUp();
        await handle({ event, resolve });
        expect(resolve).toHaveBeenCalledWith(event);
      });
    }

    it('should set userid to locals', async () => {
      event.url.pathname = '/api/wishlist';
      event.cookies.get = () => 'token';
      vi.mocked(jwt.verify).mockResolvedValueOnce({ userid: 'userid' });
      await handle({ event, resolve });
      expect(event.locals.userid).toBe('userid');
    });
  });

  it('should init DB', async () => {
    await import('../hooks.server.js');
    expect(vi.mocked(initDB)).toHaveBeenCalled();
  });

  it('should connect to IPC hub', async () => {
    await import('../hooks.server.js');
    expect(vi.mocked(connectToIPCHub)).toHaveBeenCalled();
  });
});
