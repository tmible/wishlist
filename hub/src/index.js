#!/usr/bin/env node

import 'dotenv/config.js';
import { Server } from 'node:net';
import pino from 'pino';

/** @typedef {import('node:net').Socket} Socket */

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
 * @type {{ id: string; socket: Socket }[]}
 */
const clients = [];

/**
 * При подключении очередного клиента он сохраненяется в {@link clients}.
 * При получении сообщения от клиента оно транслируется всем другим клиентам
 */
server.on('connection', (socket) => {
  const id = Math.random().toString(16);
  clients.push({ id, socket });
  logger.info({ clientId: id }, 'client connected');
  socket.on('data', (data) => {
    logger.info({ clientId: id, message: data.toString() }, 'message recieved');
    for (const client of clients.filter((socket) => socket.id !== id)) {
      client.socket.write(data);
    }
    logger.info({ clientId: id, message: data.toString() }, 'message broadcasted');
  });
});

server.listen(process.env.SOCKET_PATH);
logger.debug('server started');

process.on('SIGINT', () => server.close());
