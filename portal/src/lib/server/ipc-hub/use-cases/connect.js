import { inject } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import { Logger } from '$lib/server/logger/injection-tokens.js';
import { SocketData, SocketError } from '../events.js';
import { SocketService } from '../injection-tokens.js';
import { onMessage } from '../ipc-hub.js';

/**
 * Подключение к IPC хабу
 * @function connect
 * @returns {void}
 */
export const connect = () => {
  const logger = inject(Logger);
  subscribe(
    SocketError,
    (e) => logger.warn(`Could not connect to IPC hub with error: ${e}`),
  );
  subscribe(SocketData, onMessage);
  inject(SocketService).connectToSocket();
};
