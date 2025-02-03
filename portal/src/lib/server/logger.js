// eslint-disable-next-line unicorn/import-style -- Почему-то отключение в конфиге не работает
import { resolve } from 'node:path';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import pino from 'pino';
import { LOGS_DB_FILE_PATH, LOGS_DB_MIGRATIONS_PATH } from '$env/static/private';
import { InjectionToken } from '$lib/architecture/injection-token';

/**
 * Инициализация логгера. Логи с уровнем INFO и выше пишутся в БД.
 * Логи с уровнем DEBUG и выше пишутся в стандартный вывод.
 * Регистрация логгера в сервисе внедрения зависимостей
 * @function initLogger
 * @returns {void}
 */
export const initLogger = () => {
  const logger = pino(
    { level: 'debug' },
    pino.transport({
      targets: [
        { target: resolve(import.meta.dirname, 'pino-sqlite-transport.worker.js'), level: 'info' },
        { target: 'pino-pretty', level: 'debug', options: { destination: 1 } },
      ],
      worker: {
        env: {
          LOGS_DB_FILE_PATH,
          LOGS_DB_MIGRATIONS_PATH,
        },
      },
    }),
  );

  provide(InjectionToken.Logger, logger);
};
