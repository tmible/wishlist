import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';

const server = object([ 'on', 'listen', 'close' ]);

describe('IPC hub', () => {
  let Server;
  let pino;
  let logger;

  beforeEach(async () => {
    ({ Server } = await replaceEsm('node:net'));
    pino = await replaceEsm('pino').then((module) => module.default);
    when(new Server()).thenReturn(server);
    logger = object([ 'debug', 'info' ]);
    when(pino(), { ignoreExtraArgs: true }).thenReturn(logger);
    process.env.SOCKET_PATH = 'SOCKET_PATH';
  });

  afterEach(reset);

  it('should create logger', async () => {
    await import('../index.js');
    verify(pino(
      { level: 'debug' },
      pino.transport({
        targets: [{
          target: 'pino-pretty',
          level: 'debug',
          options: { destination: 1 },
        }],
      }),
    ));
  });

  it('should create server', async () => {
    await import('../index.js');
    verify(new Server());
  });

  describe('connecting clients', () => {
    let connectionCaptor;

    beforeEach(async () => {
      connectionCaptor = matchers.captor();
      await import('../index.js');
      verify(server.on('connection', connectionCaptor.capture()));
    });

    it('should log connection', () => {
      connectionCaptor.value(object([ 'on' ]));
      verify(logger.info({ clientId: matchers.isA(String) }, 'client connected'));
    });

    describe('sending messages', () => {
      let sockets;

      beforeEach(() => {
        sockets = new Array(2).fill(null).map(() => object([ 'on', 'write' ]));
        const dataCaptor = matchers.captor();
        sockets.forEach((socket) => connectionCaptor.value(socket));
        verify(sockets[0].on('data', dataCaptor.capture()));
        dataCaptor.value('data');
      });

      it('should log before broadcast', () => {
        verify(logger.info(
          { clientId: matchers.isA(String), message: 'data' },
          'message recieved',
        ));
      });

      it('should send messages to all connected clients', () => {
        verify(sockets[1].write('data'));
      });

      it('should not send message back to client', () => {
        verify(sockets[0].write('data'), { times: 0 });
      });

      it('should log after broadcast', () => {
        verify(logger.info(
          { clientId: matchers.isA(String), message: 'data' },
          'message broadcasted',
        ));
      });
    });
  });

  it('should start server', async () => {
    await import('../index.js');
    verify(server.listen('SOCKET_PATH'));
  });

  it('should log server start', async () => {
    await import('../index.js');
    verify(logger.debug('server started'));
  });

  it('should close servero on SIGINT', async () => {
    let sigintHandler;
    process.on = (event, handler) => {
      if (event === 'SIGINT') {
        sigintHandler = handler;
      }
    };
    await import('../index.js');
    sigintHandler();
    verify(server.close());
  });

  it('should close servero on SIGTERM', async () => {
    let sigtermHandler;
    process.on = (event, handler) => {
      if (event === 'SIGTERM') {
        sigtermHandler = handler;
      }
    };
    await import('../index.js');
    sigtermHandler();
    verify(server.close());
  });
});
