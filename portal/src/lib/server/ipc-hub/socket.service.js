import { connect } from 'node:net';
import { emit, subscribe } from '@tmible/wishlist-common/event-bus';
import { HUB_SOCKET_PATH } from '$env/static/private';
import { CheckSocketConnection, SocketData, SocketError, WriteToSocket } from './events.js';

export const connectToSocket = () => {
  const socket = connect(HUB_SOCKET_PATH);
  socket.on('error', (e) => emit(SocketError, e));
  socket.on('data', (data) => emit(SocketData, data));
  subscribe(CheckSocketConnection, () => socket.readyState === 'open');
  subscribe(WriteToSocket, (...args) => socket.write(...args));
  process.on('sveltekit:shutdown', () => {
    if (socket.readyState === 'closed') {
      return;
    }
    socket.destroySoon();
  });
};
