import { connect } from 'node:net';
import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { HUB_SOCKET_PATH } from '$env/static/private';
import { InjectionToken } from '$lib/architecture/injection-token.js';

/**
 * Подключение к IPC хабу для синхронизации списка с другими сервисами
 * @function connectToIPCHub
 * @returns {void}
 */
export const connectToIPCHub = () => {
  const logger = inject(InjectionToken.Logger);

  const socket = connect(
    HUB_SOCKET_PATH,
  ).on(
    'error',
    (e) => logger.warn(`Could not connect to IPC hub with error: ${e}`),
  );
  provide(
    InjectionToken.IPCHub,
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
