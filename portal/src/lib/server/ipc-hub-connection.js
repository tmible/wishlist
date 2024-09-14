import { connect } from 'node:net';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import { HUB_SOCKET_PATH } from '$env/static/private';
import { InjectionToken } from '$lib/architecture/injection-token.js';

/**
 * Подключение к IPC хабу для синхронизации списка с другими сервисами
 * @function connectToIPCHub
 * @returns {void}
 */
export const connectToIPCHub = () => {
  const socket = connect(
    HUB_SOCKET_PATH,
  ).on(
    'error',
    (e) => console.warn(`Could not connect to IPC hub with error: ${e}`),
  );
  provide(InjectionToken.IPCHub, { sendMessage: (...args) => socket.write(...args) });
  process.on('sveltekit:shutdown', () => socket.destroySoon());
};
