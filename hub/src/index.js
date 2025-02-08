#!/usr/bin/env node

/* eslint-disable n/no-sync -- Линейный скрипт, нет смысла запрещать синхронные функции.
  Тем более они используются при остановке процесса */
import 'dotenv/config.js';
import { existsSync, unlinkSync } from 'node:fs';
import { Server } from 'node:net';
import pino from 'pino';

/** @typedef {import('node:net').Socket} Socket */

const removeSocket = () => {
  /* eslint-disable-next-line security/detect-non-literal-fs-filename --
    Переменная окружения, никакого пользовательского ввода */
  if (existsSync(process.env.SOCKET_PATH)) {
    /* eslint-disable-next-line security/detect-non-literal-fs-filename --
      Переменная окружения, никакого пользовательского ввода */
    unlinkSync(process.env.SOCKET_PATH);
  }
};

const logger = pino(
  { level: 'debug' },
  pino.transport({
    targets: [{
      target: 'pino-pretty',
      level: 'debug',
      options: { destination: 1 },
    }],
  }),
);

/**
 * IPC сервер
 * @type {Server}
 */
const server = new Server();

/**
 * Подключённые клиенты
 * @type {Map<string, Socket>}
 */
const clients = new Map([]);

/**
 * При подключении очередного клиента он сохраненяется в {@link clients}.
 * При получении сообщения от клиента оно транслируется всем другим клиентам
 */
server.on('connection', (socket) => {
  /* eslint-disable-next-line sonarjs/pseudo-random, security-node/detect-insecure-randomness --
    Только для внутреннего использования */
  const id = Math.random().toString(16).slice(2);
  clients.set(id, socket);
  logger.info({ clientId: id }, 'client connected');

  socket.on('data', (data) => {
    logger.info({ clientId: id, message: data.toString() }, 'message recieved');
    for (const [ clientId, clientSocket ] of clients.entries()) {
      if (clientId === id) {
        continue;
      }
      clientSocket.write(data);
    }
    logger.info({ clientId: id, message: data.toString() }, 'message broadcasted');
  });

  socket.on('close', () => {
    clients.delete(id);
    logger.info({ clientId: id }, 'client disconnected');
  });
});

removeSocket();
server.listen(process.env.SOCKET_PATH);
logger.debug('server started');

process.on('SIGINT', () => {
  server.close();
  removeSocket();
});
process.on('SIGTERM', () => {
  server.close();
  removeSocket();
});
/* eslint-enable n/no-sync */
