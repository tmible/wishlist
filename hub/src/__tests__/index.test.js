/* eslint-disable n/no-sync -- В соответствии с тестируемым кодом */
import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify, when } from 'testdouble';

const server = object([ 'on', 'listen', 'close' ]);

describe('IPC hub', () => {
  let existsSync;
  let unlinkSync;
  let Server;
  let pino;
  let logger;

  beforeEach(async () => {
    ({ Server } = await replaceEsm('node:net'));
    ({ existsSync, unlinkSync } = await replaceEsm('node:fs'));
    pino = await replaceEsm('pino').then((module) => module.default);
    when(existsSync(), { ignoreExtraArgs: true }).thenReturn(false);
    when(new Server()).thenReturn(server);
    logger = object([ 'debug', 'info' ]);
    when(pino(), { ignoreExtraArgs: true }).thenReturn(logger);
    process.env.SOCKET_PATH = 'SOCKET_PATH';
    process.on = () => {};
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

    describe('disconnecting clients', () => {
      let sockets;
      let dataCaptor;

      beforeEach(() => {
        sockets = new Array(3).fill(null).map(() => object([ 'on', 'write' ]));
        dataCaptor = matchers.captor();
        const closeCaptor = matchers.captor();
        sockets.forEach((socket) => connectionCaptor.value(socket));
        verify(sockets[0].on('data', dataCaptor.capture()));
        verify(sockets[0].on('close', closeCaptor.capture()));
        closeCaptor.value();
      });

      it('should log disconnection', () => {
        verify(logger.info(
          { clientId: matchers.isA(String) },
          'client disconnected',
        ));
      });

      it('should not send messages to disconnected clients', () => {
        dataCaptor.value('data');
        verify(sockets[0].write('data'), { times: 0 });
      });
    });
  });

  it('should check if unix socket exists', async () => {
    await import('../index.js');
    verify(existsSync('SOCKET_PATH'));
  });

  it('should delete unix socket if it exists', async () => {
    when(existsSync('SOCKET_PATH')).thenReturn(true);
    await import('../index.js');
    verify(unlinkSync('SOCKET_PATH'));
  });

  it('should start server', async () => {
    await import('../index.js');
    verify(server.listen('SOCKET_PATH'));
  });

  it('should log server start', async () => {
    await import('../index.js');
    verify(logger.debug('server started'));
  });

  describe('on SIGINT', () => {
    let sigintHandler;

    beforeEach(async () => {
      process.on = (event, handler) => {
        if (event === 'SIGINT') {
          sigintHandler = handler;
        }
      };
      await import('../index.js');
    });

    it('should close server', () => {
      sigintHandler();
      verify(server.close());
    });

    it('should check if unix socket exists', () => {
      sigintHandler();

      /* Проверка 2 вызовов, чтобы убедиться, что проверка
        происходит не только на верхнем уровне при запуске сервера */
      verify(existsSync('SOCKET_PATH'), { times: 2 });
    });

    it('should delete unix socket if it exists', () => {
      when(existsSync('SOCKET_PATH')).thenReturn(true);
      sigintHandler();
      verify(unlinkSync('SOCKET_PATH'));
    });
  });

  describe('on SIGTERM', () => {
    let sigtermHandler;

    beforeEach(async () => {
      process.on = (event, handler) => {
        if (event === 'SIGTERM') {
          sigtermHandler = handler;
        }
      };
      await import('../index.js');
    });

    it('should close server', () => {
      sigtermHandler();
      verify(server.close());
    });

    it('should check if unix socket exists', () => {
      sigtermHandler();

      /* Проверка 2 вызовов, чтобы убедиться, что проверка
        происходит не только на верхнем уровне при запуске сервера */
      verify(existsSync('SOCKET_PATH'), { times: 2 });
    });

    it('should delete unix socket if it exists', () => {
      when(existsSync('SOCKET_PATH')).thenReturn(true);
      sigtermHandler();
      verify(unlinkSync('SOCKET_PATH'));
    });
  });
});
/* eslint-enable n/no-sync */
