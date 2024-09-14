import { connect } from 'node:net';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token.js';
import { connectToIPCHub } from '../ipc-hub-connection.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('node:net');
vi.mock('$env/static/private', () => ({ HUB_SOCKET_PATH: 'HUB_SOCKET_PATH' }));

describe('IPC hub connection', () => {
  let socket;

  beforeEach(() => {
    socket = {
      write: vi.fn(),
      destroySoon: vi.fn(),
    };
    vi.mocked(connect).mockReturnValue(socket);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should connect to socket', () => {
    connectToIPCHub();
    expect(vi.mocked(connect)).toHaveBeenCalledWith('HUB_SOCKET_PATH');
  });

  it('should provide connection object', () => {
    connectToIPCHub();
    expect(
      vi.mocked(provide),
    ).toHaveBeenCalledWith(
      InjectionToken.IPCHub,
      { sendMessage: expect.any(Function) },
    );
  });

  it('should write to socket', () => {
    let sendMessage;
    vi.mocked(provide).mockImplementation((token, value) => ({ sendMessage } = value));
    connectToIPCHub();
    sendMessage('data');
    expect(socket.write).toHaveBeenCalledWith('data');
  });

  it('should set close listener', () => {
    vi.spyOn(process, 'on');
    connectToIPCHub();
    expect(process.on).toHaveBeenCalledWith('sveltekit:shutdown', expect.any(Function));
  });

  it('should close db on close listener invocation', () => {
    let handler;
    vi.spyOn(process, 'on').mockImplementation((eventName, eventHandler) => handler = eventHandler);
    connectToIPCHub();
    handler();
    expect(socket.destroySoon).toHaveBeenCalled();
  });
});
