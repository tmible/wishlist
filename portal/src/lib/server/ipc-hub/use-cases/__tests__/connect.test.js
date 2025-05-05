import { connect as connectToSocket } from 'node:net';
import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from '$lib/server/logger/injection-tokens.js';
import { IPCHub } from '../../injection-tokens.js';
import { connect } from '../connect.js';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('node:net');
vi.mock('$env/static/private', () => ({ HUB_SOCKET_PATH: 'HUB_SOCKET_PATH' }));
vi.mock('$lib/server/logger/injection-tokens.js', () => ({ Logger: 'logger' }));
vi.mock('../../injection-tokens.js', () => ({ IPCHub: 'ipc hub' }));

describe('IPC hub / use cases / connect to IPC hub', () => {
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
    vi.mocked(connectToSocket).mockReturnValue(socket);
    vi.mocked(inject).mockReturnValueOnce(logger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject logger', () => {
    connect();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(vi.mocked(Logger));
  });

  it('should connect to socket', () => {
    connect();
    expect(vi.mocked(connectToSocket)).toHaveBeenCalledWith('HUB_SOCKET_PATH');
  });

  it('should catch socket errors', () => {
    connect();
    expect(socket.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('should log socket errors', () => {
    let handler;
    socket.on.mockImplementation((eventName, eventHandler) => {
      handler = eventHandler;
      return socket;
    });
    connect();
    handler('error');
    expect(logger.warn).toHaveBeenCalledWith('Could not connect to IPC hub with error: error');
  });

  it('should provide connection object', () => {
    connect();
    expect(
      vi.mocked(provide),
    ).toHaveBeenCalledWith(
      vi.mocked(IPCHub),
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
    connect();
    expect(isConnected()).toBe(false);
  });

  it('should write to socket', () => {
    let sendMessage;
    vi.mocked(provide).mockImplementation((token, value) => ({ sendMessage } = value));
    connect();
    sendMessage('data');
    expect(socket.write).toHaveBeenCalledWith('data');
  });

  it('should set close listener', () => {
    vi.spyOn(process, 'on');
    connect();
    expect(process.on).toHaveBeenCalledWith('sveltekit:shutdown', expect.any(Function));
  });

  it('should close connection on close listener invocation', () => {
    let handler;
    vi.spyOn(process, 'on').mockImplementation((eventName, eventHandler) => handler = eventHandler);
    connect();
    handler();
    expect(socket.destroySoon).toHaveBeenCalled();
  });

  it('should not close connection on close listener invocation if it is already closed', () => {
    let handler;
    vi.spyOn(process, 'on').mockImplementation((eventName, eventHandler) => handler = eventHandler);
    socket.readyState = 'closed';
    connect();
    handler();
    expect(socket.destroySoon).not.toHaveBeenCalled();
  });
});
