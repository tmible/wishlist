import { emit } from '@tmible/wishlist-common/event-bus';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACCESS_TOKEN_COOKIE_NAME } from '$lib/constants/access-token-cookie-name.const.js';
import { REFRESH_TOKEN_COOKIE_NAME } from '$lib/constants/refresh-token-cookie-name.const.js';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '$lib/constants/refresh-token-cookie-options.const.js';
import {
  UNKNOWN_USER_UUID_COOKIE_NAME,
} from '$lib/constants/unknown-user-uuid-cookie-name.const.js';
import { authenticationMiddleware } from '../authentication-middleware.js';
import { GetRefreshToken } from '../events.js';
import { generateAndStoreAuthTokens } from '../generate-and-store-auth-tokens.js';

vi.mock('node:util', () => ({ promisify: (original) => original }));
vi.mock('jsonwebtoken');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$env/dynamic/private', () => ({ env: { HMAC_SECRET: 'HMAC secret' } }));
vi.mock('../events.js', () => ({ GetRefreshToken: 'get refresh token' }));
vi.mock('../generate-and-store-auth-tokens.js');

describe('user / authentication middleware', () => {
  let event;

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    event = {
      url: { pathname: '/api' },
      cookies: { get: vi.fn(), delete: vi.fn() },
      locals: {},
    };
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

      it('should fail if there are no auth tokens in cookies', async () => {
        event.cookies.get = () => {};
        await expect(
          authenticationMiddleware(event, () => {}),
        ).resolves.toEqual(
          new Response(null, { status: 401 }),
        );
      });

      describe('if there is access token cookie', () => {
        beforeEach(() => {
          event.cookies.get = () => 'jwt';
        });

        it('should verify it\'s value', async () => {
          await authenticationMiddleware(event, () => {});
          expect(jwt.verify).toHaveBeenCalledWith('jwt', 'HMAC secret');
        });

        it('should fail if verification fails', async () => {
          vi.mocked(jwt.verify).mockImplementation(() => {
            throw new Error('verification failed');
          });
          await expect(
            authenticationMiddleware(event, () => {}),
          ).resolves.toEqual(
            new Response(null, { status: 401 }),
          );
        });
      });

      describe('if there is no access token cookie, but there is refresh token cookie', () => {
        const cookies = {
          [ACCESS_TOKEN_COOKIE_NAME]: undefined,
          [REFRESH_TOKEN_COOKIE_NAME]: 'refresh token',
          [UNKNOWN_USER_UUID_COOKIE_NAME]: 'unknown user UUID',
        };

        beforeEach(() => {
          event.cookies.get.mockImplementation((key) => cookies[key]);
          vi.spyOn(Date, 'now').mockReturnValue(0);
        });

        it('should get refresh token from cookie', async () => {
          await authenticationMiddleware(event, () => {});
          expect(event.cookies.get).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE_NAME);
        });

        it('should emit GetRefreshToken event', async () => {
          await authenticationMiddleware(event, () => {});
          expect(
            vi.mocked(emit),
          ).toHaveBeenCalledWith(
            vi.mocked(GetRefreshToken),
            'unknown user UUID',
          );
        });

        const reissueAuthTokensFailTestCases = [{
          description: 'if there is no refresh token in cookie',
          setUp: () => cookies[REFRESH_TOKEN_COOKIE_NAME] = '',
          tearDown: () => cookies[REFRESH_TOKEN_COOKIE_NAME] = 'refresh token',
        }, {
          description: 'if there is no refresh token in DB',
          setUp: () => vi.mocked(emit).mockReturnValueOnce({}),
          tearDown: () => {},
        }, {
          description: 'if refresh tokens from cookie and DB are not equal',
          setUp: () => {
            cookies[REFRESH_TOKEN_COOKIE_NAME] = 'refresh token 1';
            vi.mocked(emit).mockReturnValueOnce({ token: 'refresh token 2' });
          },
          tearDown: () => cookies[REFRESH_TOKEN_COOKIE_NAME] = 'refresh token',
        }, {
          description: 'if tokens are equal, but expiration is undefined',
          setUp: () => {
            vi.mocked(emit).mockReturnValueOnce({ token: 'refresh token', expires: undefined });
            vi.spyOn(Date, 'now').mockReturnValueOnce(1);
          },
          tearDown: () => {},
        }, {
          description: 'if tokens are equal, but expired',
          setUp: () => {
            vi.mocked(emit).mockReturnValueOnce({ token: 'refresh token', expires: 1 });
            vi.spyOn(Date, 'now').mockReturnValueOnce(2000);
          },
          tearDown: () => {},
        }];

        for (const { description, setUp, tearDown } of reissueAuthTokensFailTestCases) {
          describe(description, () => {
            beforeEach(setUp);

            afterEach(tearDown);

            it('should delete cookie', async () => {
              try {
                await authenticationMiddleware(event, () => {});
              } catch {
                expect(
                  event.cookies.delete,
                ).toHaveBeenCalledWith(
                  REFRESH_TOKEN_COOKIE_NAME,
                  REFRESH_TOKEN_COOKIE_OPTIONS,
                );
              }
            });

            it('should throw error', async () => {
              await expect(
                authenticationMiddleware(event, () => {}),
              ).resolves.toEqual(
                new Response(null, { status: 401 }),
              );
            });
          });
        }

        it('should generate and store new pair of tokens', async () => {
          vi.mocked(emit).mockReturnValueOnce(
            { token: 'refresh token', userid: 'userid', expires: 1 },
          );
          vi.spyOn(Date, 'now').mockReturnValueOnce(1);
          await authenticationMiddleware(event, () => {});
          expect(
            vi.mocked(generateAndStoreAuthTokens),
          ).toHaveBeenCalledWith(
            event.cookies,
            'userid',
          );
        });
      });
    });
  }

  const nextTestCases = [{
    condition: 'pathname doesn\'t start with /api/wishlist/ and is not /api/user/hash',
    setUp: () => {
      event.url.path = '/api';
    },
  }, {
    condition: 'access token is valid',
    setUp: () => {
      const cookies = {
        [ACCESS_TOKEN_COOKIE_NAME]: 'jwt',
        [REFRESH_TOKEN_COOKIE_NAME]: undefined,
      };
      event.cookies.get = (key) => cookies[key];
      event.url.path = '/api/wishlist';
    },
  }, {
    condition: 'there is no access token, but refresh token is valid',
    setUp: () => {
      const cookies = {
        [ACCESS_TOKEN_COOKIE_NAME]: undefined,
        [REFRESH_TOKEN_COOKIE_NAME]: 'refresh token',
      };
      event.cookies.get = (key) => cookies[key];
      event.url.path = '/api/wishlist';
    },
  }];

  for (const { condition, setUp } of nextTestCases) {
    it(`should call next if ${condition}`, async () => {
      setUp();
      const next = vi.fn();
      await authenticationMiddleware(event, next);
      expect(next).toHaveBeenCalledWith(event);
    });
  }

  it('should set userid to locals', async () => {
    event.url.pathname = '/api/wishlist';
    event.cookies.get = () => 'token';
    vi.mocked(jwt.verify).mockResolvedValueOnce({ userid: 'userid' });
    await authenticationMiddleware(event, () => {});
    expect(event.locals.userid).toBe('userid');
  });
});
