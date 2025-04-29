import { dirname } from 'node:path';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import pino from 'pino';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLoggingMiddleware } from '../create-logging-middleware.js';
import { CreateLoggingMiddleware } from '../events.js';
import { initLogger } from '../initialization.js';
import { Logger } from '../injection-tokens.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('pino');
vi.mock(
  '$env/static/private',
  () => ({
    LOGS_DB_FILE_PATH: 'LOGS_DB_FILE_PATH',
    LOGS_DB_MIGRATIONS_PATH: 'LOGS_DB_MIGRATIONS_PATH',
  }),
);

describe('logger / initialization', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initalize logger', () => {
    vi.mocked(pino).transport = vi.fn((...args) => [ 'pino.transport', ...args ]);

    initLogger();

    // Замена вручную, чтобы тест проходил, несмотря на разные пути в разных средах
    const [ target ] = vi.mocked(pino).mock.lastCall[1][1].targets;
    target.target = target.target.replace(dirname(import.meta.dirname), '/import/meta/dirname');

    expect(vi.mocked(pino).mock.lastCall).toMatchSnapshot();
  });

  it('should provide logger', () => {
    vi.mocked(pino).mockReturnValueOnce('logger');
    initLogger();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(Logger, 'logger');
  });

  it('should subscribe to CreateLoggingMiddleware event', () => {
    initLogger();
    expect(
      vi.mocked(subscribe),
    ).toHaveBeenCalledWith(
      CreateLoggingMiddleware,
      createLoggingMiddleware,
    );
  });
});
