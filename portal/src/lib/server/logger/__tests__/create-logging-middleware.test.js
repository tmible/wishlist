import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLoggingMiddleware } from '../create-logging-middleware.js';
import { Logger } from '../injection-tokens.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

describe('logger / create logging middleware', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject logger', () => {
    createLoggingMiddleware();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Logger);
  });

  it('should return middleware', () => {
    expect(createLoggingMiddleware()).toEqual(expect.any(Function));
  });

  describe('middleware', () => {
    const logger = { info: vi.fn() };
    const next = vi.fn();

    let middleware;
    let event;
    let response;

    beforeEach(() => {
      event = {
        locals: {},
        cookies: {
          get: vi.fn().mockReturnValue('unknown user UUID'),
          getAll: vi.fn(() => [{ name: 'name', value: 'value' }]),
        },
        request: {
          method: 'method',
          body: 'body',
          clone: vi.fn().mockReturnValue({ text: vi.fn().mockResolvedValue('body') }),
        },
        url: { pathname: 'pathname' },
      };
      response = {
        status: 'status',
        body: null,
      };
      vi.mocked(inject).mockReturnValueOnce(logger);
      vi.spyOn(crypto, 'randomUUID').mockReturnValueOnce('random UUID');
      next.mockReturnValueOnce(response);
      middleware = createLoggingMiddleware();
    });

    it('should assign request random UUID', async () => {
      await middleware(event, next);
      expect(event.locals.requestUuid).toBe('random UUID');
    });

    it('should log request', async () => {
      let info;
      logger.info.mockImplementationOnce((...args) => info = args);
      await middleware(event, next);
      expect(info).toMatchSnapshot();
    });

    it('should log request alternatively', async () => {
      event.cookies.get.mockReturnValueOnce(null);
      event.request.body = null;
      event.locals.userid = 'userid';
      let info;
      logger.info.mockImplementationOnce((...args) => info = args);
      await middleware(event, next);
      expect(info).toMatchSnapshot();
    });

    it('should call next', async () => {
      await middleware(event, next);
      expect(next).toHaveBeenCalledWith(event);
    });

    it('should log response', async () => {
      let info;
      logger.info.mockImplementationOnce(() => {}).mockImplementationOnce((...args) => info = args);
      await middleware(event, next);
      expect(info).toMatchSnapshot();
    });

    it('should log response alternatively', async () => {
      event.cookies.get.mockReturnValueOnce(null);
      event.request.body = null;
      event.locals.userid = 'userid';
      let info;
      logger.info.mockImplementationOnce(() => {}).mockImplementationOnce((...args) => info = args);
      await middleware(event, next);
      expect(info).toMatchSnapshot();
    });

    it('should return response', async () => {
      await expect(middleware(event, next)).resolves.toEqual(response);
    });
  });
});
