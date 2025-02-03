import { inject } from '@tmible/wishlist-common/dependency-injector';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { initDB } from '$lib/server/db';
import { connectToIPCHub } from '$lib/server/ipc-hub-connection';
import { initLogger } from '$lib/server/logger';
import { initLogsDB } from '$lib/server/logs-db';

const resolve = vi.fn();
vi.mock('$env/dynamic/private', () => ({ env: { HMAC_SECRET: 'HMAC secret' } }));
vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock('jsonwebtoken');
vi.mock('$lib/server/db');
vi.mock('$lib/server/ipc-hub-connection');
vi.mock('$lib/server/logger');
vi.mock('$lib/server/logs-db');

describe('server hooks', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('auth middleware', () => {
    let handle;
    let event;

    it('should resolve if pathname doesn\'t start with /api', async () => {
      event = { url: { pathname: 'pathname' } };
      ({ handle } = await import('../hooks.server.js'));
      resolve.mockResolvedValueOnce('resolve');
      await expect(handle({ event, resolve })).resolves.toBe('resolve');
    });

    describe('if pathname starts with /api', () => {
      const logger = { info: vi.fn() };

      beforeEach(async () => {
        event = {
          url: { pathname: '/api' },
          cookies: {
            get: () => 'unknownUserUuid',
            getAll: () => [{ name: 'cookie 1', value: 'value 1' }],
          },
          locals: {},
          request: {
            body: 'body',
            clone: () => ({ text: () => Promise.resolve('body') }),
            method: 'method',
          },
        };
        vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'randomUUID') });
        ({ handle } = await import('../hooks.server.js'));
        vi.mocked(inject).mockReturnValueOnce(logger);
        resolve.mockResolvedValueOnce({
          body: 'body',
          clone: () => ({ text: () => Promise.resolve('body') }),
          status: 'status',
        });
      });

      it('should assign request random UUID', async () => {
        await handle({ event, resolve });
        expect(event.locals.requestUuid).toBe('randomUUID');
      });

      it('should inject logger', async () => {
        await handle({ event, resolve });
        expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.Logger);
      });

      it('should log request', async () => {
        await handle({ event, resolve });
        expect(
          logger.info,
        ).toHaveBeenCalledWith(
          { requestUuid: 'randomUUID', unknownUserUuid: 'unknownUserUuid' },
          'request method /api; cookie: cookie 1=value 1; body: body',
        );
      });

      it('should log response', async () => {
        await handle({ event, resolve });
        expect(
          logger.info,
        ).toHaveBeenCalledWith(
          {
            requestUuid: 'randomUUID',
            unknownUserUuid: 'unknownUserUuid',
            userid: null,
          },
          'response status; body: body',
        );
      });

      const failTestCases = [{
        condition: 'starts with /api/wishlist',
        path: '/api/wishlist/',
      }, {
        condition: 'equals /api/user/hash',
        path: '/api/user/hash',
      }];

      for (const { condition, path } of failTestCases) {
        describe(`if pathname ${condition}`, () => {
          beforeEach(() => {
            event.url.pathname = path;
          });

          it('should fail if there is no cookie', async () => {
            event.cookies.get = () => {};
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
      }

      const resolveTestCases = [{
        condition: 'pathname doesn\'t start with /api/wishlist/ and is not /api/user/hash',
        setUp: () => {
          event.url.path = '/api';
        },
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
  });

  describe('error handler', () => {
    const error = { stack: 'stack' };
    const event = {
      locals: {
        requestUuid: 'requestUuid',
        userid: 'userid',
      },
      cookies: {
        get: () => 'unknownUserUuid',
      },
    };
    const logger = { error: vi.fn() };

    let handleError;

    beforeEach(async () => {
      ({ handleError } = await import('../hooks.server.js'));
      vi.mocked(inject).mockReturnValueOnce(logger);
    });

    it('should inject logger', () => {
      handleError({ error, event });
      expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.Logger);
    });

    it('should log error', () => {
      handleError({ error, event });
      expect(
        logger.error,
      ).toHaveBeenCalledWith(
        {
          requestUuid: 'requestUuid',
          unknownUserUuid: 'unknownUserUuid',
          userid: 'userid',
        },
        'error stack',
      );
    });
  });

  it('should init DB', async () => {
    await import('../hooks.server.js');
    expect(vi.mocked(initDB)).toHaveBeenCalled();
  });

  it('should init logs DB', async () => {
    await import('../hooks.server.js');
    expect(vi.mocked(initLogsDB)).toHaveBeenCalled();
  });

  it('should init logger', async () => {
    await import('../hooks.server.js');
    expect(vi.mocked(initLogger)).toHaveBeenCalled();
  });

  it('should connect to IPC hub', async () => {
    await import('../hooks.server.js');
    expect(vi.mocked(connectToIPCHub)).toHaveBeenCalled();
  });
});
