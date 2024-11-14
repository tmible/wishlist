import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const [
  { connect },
  { inject, provide },
  { autoUpdateFromIPCHub },
] = await Promise.all([
  replaceEsm('node:net'),
  replaceModule('@tmible/wishlist-common/dependency-injector'),
  replaceModule('@tmible/wishlist-bot/services/lists-auto-update'),
]);

const connectToIPCHub = await import(
  '../ipc-hub-connection.service.js'
).then((module) => module.default);

describe('IPC hub connection service', () => {
  let socket;

  beforeEach(() => {
    process.env.HUB_SOCKET_PATH = 'HUB_SOCKET_PATH';
    when(inject(InjectionToken.LocalDatabase)).thenReturn(() => 'db');
    when(inject(InjectionToken.EventBus)).thenReturn('eventBus');
    when(inject(InjectionToken.Logger)).thenReturn('logger');
    socket = object([ 'on', 'destroySoon' ]);
    when(connect(), { ignoreExtraArgs: true }).thenReturn(socket);
  });

  afterEach(reset);

  it('should inject DB', () => {
    connectToIPCHub();
    verify(inject(InjectionToken.LocalDatabase)('auto-update'));
  });

  it('should inject event bus', () => {
    connectToIPCHub();
    verify(inject(InjectionToken.EventBus));
  });

  it('should inject logger', () => {
    connectToIPCHub();
    verify(inject(InjectionToken.Logger));
  });

  it('should connect to socket', () => {
    connectToIPCHub();
    verify(connect('HUB_SOCKET_PATH'));
  });

  it('should catch socket errors', () => {
    connectToIPCHub();
    verify(socket.on('error', matchers.isA(Function)));
  });

  it('should log socket errors', async () => {
    const logger = object([ 'warn' ]);
    when(inject(InjectionToken.Logger)).thenReturn(logger);
    const captor = matchers.captor();
    connectToIPCHub();
    verify(socket.on('error', captor.capture()));
    await captor.value('error');
    verify(logger.warn('Could not connect to IPC hub with error: error'));
  });

  it('should listen to messages from hub', () => {
    connectToIPCHub();
    verify(socket.on('data', matchers.isA(Function)));
  });

  describe('on message from hub', () => {
    const bot = object([ 'telegram' ]);
    let captor;

    beforeEach(() => {
      captor = matchers.captor();
      connectToIPCHub(bot);
      verify(socket.on('data', captor.capture()));
    });

    it('should auto update if message is valid', async () => {
      await captor.value('update 123');
      verify(autoUpdateFromIPCHub('db', 'eventBus', bot.telegram, 'logger', 123));
    });

    it('should not auto update if message is invalid', async () => {
      await captor.value('random message');
      verify(autoUpdateFromIPCHub(), { ignoreExtraArgs: true, times: 0 });
    });
  });

  it('should provide connection object', () => {
    connectToIPCHub();
    verify(provide(InjectionToken.IPCHub, { isConnected: matchers.isA(Function) }));
  });

  it('should check socket connection', () => {
    const captor = matchers.captor();
    connectToIPCHub();
    verify(provide(InjectionToken.IPCHub, captor.capture()));
    socket.readyState = 'readyState';
    assert.equal(captor.value.isConnected(), false);
  });

  it('should destroy socket on returned function invocation', () => {
    const closeConnection = connectToIPCHub();
    socket.readyState = 'readyState';
    closeConnection();
    verify(socket.destroySoon());
  });

  it('should not destroy socket on returned function invocation if it is already destroyed', () => {
    const closeConnection = connectToIPCHub();
    socket.readyState = 'closed';
    closeConnection();
    verify(socket.destroySoon(), { times: 0 });
  });
});
