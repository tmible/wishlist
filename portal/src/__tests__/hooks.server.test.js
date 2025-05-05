import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initActionsFeature } from '$lib/server/actions/initialization.js';
import { initCategoriesFeature } from '$lib/server/categories/initialization.js';
import { chainMiddlewares } from '$lib/server/chain-middlewares.js';
import { initDB } from '$lib/server/db/initialization.js';
import { connect } from '$lib/server/ipc-hub/use-cases/connect.js';
import { initLogger } from '$lib/server/logger/initialization.js';
import { Logger } from '$lib/server/logger/injection-tokens.js';
import { getLoggingMiddleware } from '$lib/server/logger/use-cases/get-logging-middleware.js';
import { initDB as initLogsDB } from '$lib/server/logs-db/initialization.js';
import { authenticationMiddleware } from '$lib/server/user/authentication-middleware.js';
import { initUserFeature } from '$lib/server/user/initialization.js';
import { initWishlistFeature } from '$lib/server/wishlist/initialization.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('$lib/server/actions/initialization.js');
vi.mock('$lib/server/categories/initialization.js');
vi.mock('$lib/server/chain-middlewares.js');
vi.mock('$lib/server/db/initialization.js');
vi.mock('$lib/server/ipc-hub/use-cases/connect.js');
vi.mock('$lib/server/logger/initialization.js');
vi.mock('$lib/server/logger/injection-tokens.js', () => ({ Logger: 'logger' }));
vi.mock('$lib/server/logger/use-cases/get-logging-middleware.js');
vi.mock('$lib/server/logs-db/initialization.js');
vi.mock('$lib/server/user/initialization.js');
vi.mock('$lib/server/wishlist/initialization.js');

describe('server hooks', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('handler', () => {
    let event;
    let resolve;
    let handle;

    beforeEach(() => {
      event = { url: { pathname: '' } };
      resolve = vi.fn();
    });

    it('should chain middlewares', async () => {
      vi.mocked(getLoggingMiddleware).mockReturnValueOnce('logging middleware');
      ({ handle } = await import('../hooks.server.js'));
      expect(
        vi.mocked(chainMiddlewares),
      ).toHaveBeenCalledWith(
        'logging middleware',
        authenticationMiddleware,
      );
    });

    it('should handle api requests', async () => {
      event.url.pathname = '/api';
      const chain = vi.fn();
      vi.mocked(chainMiddlewares).mockReturnValueOnce(chain);
      ({ handle } = await import('../hooks.server.js'));
      handle({ event, resolve });
      expect(chain).toHaveBeenCalledWith(event, resolve);
    });

    it('should handle other requests', async () => {
      ({ handle } = await import('../hooks.server.js'));
      handle({ event, resolve });
      expect(resolve).toHaveBeenCalledWith(event);
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

    beforeEach(async () => {
      const { handleError } = await import('../hooks.server.js');
      vi.mocked(inject).mockReturnValueOnce(logger);
      handleError({ error, event });
    });

    it('should inject logger', () => {
      expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Logger));
    });

    it('should log error', () => {
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
    expect(vi.mocked(connect)).toHaveBeenCalled();
  });

  it('should init actions feature', async () => {
    await import('../hooks.server.js');
    expect(vi.mocked(initActionsFeature)).toHaveBeenCalled();
  });

  it('should init user feature', async () => {
    await import('../hooks.server.js');
    expect(vi.mocked(initUserFeature)).toHaveBeenCalled();
  });

  it('should init categories feature', async () => {
    await import('../hooks.server.js');
    expect(vi.mocked(initCategoriesFeature)).toHaveBeenCalled();
  });

  it('should init wishlist feature', async () => {
    await import('../hooks.server.js');
    expect(vi.mocked(initWishlistFeature)).toHaveBeenCalled();
  });
});
