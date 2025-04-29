import { connect as connectToSocket } from 'node:net';
import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { HUB_SOCKET_PATH } from '$env/static/private';
import { Logger } from '$lib/server/logger/injection-tokens.js';
import { IPCHub } from '../injection-tokens.js';

/**
 * Подключение к IPC хабу для синхронизации списка с другими сервисами
 * @function connect
 * @returns {void}
 */
export const connect = () => {
  const logger = inject(Logger);

  const socket = connectToSocket(
    HUB_SOCKET_PATH,
  ).on(
    'error',
    (e) => logger.warn(`Could not connect to IPC hub with error: ${e}`),
  );

  provide(
    IPCHub,
    {
      isConnected: () => socket.readyState === 'open',
      sendMessage: (...args) => socket.write(...args),
    },
  );

  process.on('sveltekit:shutdown', () => {
    if (socket.readyState === 'closed') {
      return;
    }
    socket.destroySoon();
  });
};
