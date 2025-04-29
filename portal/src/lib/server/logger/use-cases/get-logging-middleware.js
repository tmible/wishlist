import { emit } from '@tmible/wishlist-common/event-bus';
import { CreateLoggingMiddleware } from '../events.js';

/** @typedef {import('../create-logging-middleware.js').LoggingMiddleware} LoggingMiddleware */

/** @module Сценарий получения промежуточного обработчика, логирующего запросы и ответы на них */

/**
 * Получение промежуточного обработчика
 * @function getLoggingMiddleware
 * @returns {LoggingMiddleware} Промежуточный обработчик
 */
export const getLoggingMiddleware = () => emit(CreateLoggingMiddleware);
