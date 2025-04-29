import { resolve } from 'node:path';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import pino from 'pino';
import { LOGS_DB_FILE_PATH, LOGS_DB_MIGRATIONS_PATH } from '$env/static/private';
import { createLoggingMiddleware } from './create-logging-middleware.js';
import { CreateLoggingMiddleware } from './events.js';
import { Logger } from './injection-tokens.js';

/**
 * Инициализация логгера. Логи с уровнем INFO и выше пишутся в БД.
 * Логи с уровнем DEBUG и выше пишутся в стандартный вывод.
 * Регистрация логгера в сервисе внедрения зависимостей.
 * Подписка на событие создания промежуточного обработчика
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

  provide(Logger, logger);
  subscribe(CreateLoggingMiddleware, createLoggingMiddleware);
};
