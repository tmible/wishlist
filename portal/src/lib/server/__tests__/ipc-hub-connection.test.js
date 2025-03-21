import { connect } from 'node:net';
import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token.js';
import { connectToIPCHub } from '../ipc-hub-connection.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('node:net');
vi.mock('$env/static/private', () => ({ HUB_SOCKET_PATH: 'HUB_SOCKET_PATH' }));

describe('IPC hub connection', () => {
  let socket;
  let logger;

  beforeEach(() => {
    socket = {
      on: vi.fn(),
      write: vi.fn(),
      destroySoon: vi.fn(),
    };
    logger = { warn: vi.fn() };
    socket.on.mockReturnValue(socket);
    vi.mocked(connect).mockReturnValue(socket);
    vi.mocked(inject).mockReturnValueOnce(logger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject logger', () => {
    connectToIPCHub();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.Logger);
  });

  it('should connect to socket', () => {
    connectToIPCHub();
    expect(vi.mocked(connect)).toHaveBeenCalledWith('HUB_SOCKET_PATH');
  });

  it('should catch socket errors', () => {
    connectToIPCHub();
    expect(socket.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('should log socket errors', () => {
    let handler;
    socket.on.mockImplementation((eventName, eventHandler) => {
      handler = eventHandler;
      return socket;
    });
    connectToIPCHub();
    handler('error');
    expect(logger.warn).toHaveBeenCalledWith('Could not connect to IPC hub with error: error');
  });

  it('should provide connection object', () => {
    connectToIPCHub();
    expect(
      vi.mocked(provide),
    ).toHaveBeenCalledWith(
      InjectionToken.IPCHub,
      {
        isConnected: expect.any(Function),
        sendMessage: expect.any(Function),
      },
    );
  });

  it('should check socket connection', () => {
    let isConnected;
    vi.mocked(provide).mockImplementation((token, value) => ({ isConnected } = value));
    socket.readyState = 'readyState';
    connectToIPCHub();
    expect(isConnected()).toBe(false);
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

  it('should close connection on close listener invocation', () => {
    let handler;
    vi.spyOn(process, 'on').mockImplementation((eventName, eventHandler) => handler = eventHandler);
    connectToIPCHub();
    handler();
    expect(socket.destroySoon).toHaveBeenCalled();
  });

  it('should not close connection on close listener invocation if it is already closed', () => {
    let handler;
    vi.spyOn(process, 'on').mockImplementation((eventName, eventHandler) => handler = eventHandler);
    socket.readyState = 'closed';
    connectToIPCHub();
    handler();
    expect(socket.destroySoon).not.toHaveBeenCalled();
  });
});
