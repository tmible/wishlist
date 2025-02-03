// eslint-disable-next-line unicorn/import-style -- Почему-то отключение в конфиге не работает
import { dirname } from 'node:path';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import pino from 'pino';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token.js';
import { initLogger } from '../logger.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('pino');
vi.mock(
  '$env/static/private',
  () => ({
    LOGS_DB_FILE_PATH: 'LOGS_DB_FILE_PATH',
    LOGS_DB_MIGRATIONS_PATH: 'LOGS_DB_MIGRATIONS_PATH',
  }),
);

describe('logger initializer', () => {
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
    expect(vi.mocked(provide)).toHaveBeenCalledWith(InjectionToken.Logger, 'logger');
  });
});
