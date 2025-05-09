import { provide } from '@tmible/wishlist-common/dependency-injector';
import { IPCHub, SocketService } from './injection-tokens.js';
import { ipcHub } from './ipc-hub.js';
import * as socketService from './socket.service.js';

/**
 * Регистрация зависимостей для работы с IPC хабом
 * @function initIPCHub
 * @returns {void}
 */
const initIPCHub = () => {
  provide(SocketService, socketService);
  provide(IPCHub, ipcHub);
};

export default initIPCHub;
