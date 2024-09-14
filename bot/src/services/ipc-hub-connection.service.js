import { connect } from 'node:net';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import { autoUpdateFromIPCHub } from '@tmible/wishlist-bot/services/lists-auto-update';

/** @typedef {import('telegraf').Telegraf} Telegraf */

/** @module Сервис подключения к IPC хабу */

/**
 * Подключения к IPC хабу и вызова автоматического обновления списков
 * при получении соответсвующего сообщения от хаба
 * @function connectToIPCHub
 * @param {Telegraf} bot Бот
 * @returns {void}
 */
const connectToIPCHub = (bot) => {
  const db = inject(InjectionToken.LocalDatabase)('auto-update');
  const eventBus = inject(InjectionToken.EventBus);

  const socket = connect(
    process.env.HUB_SOCKET_PATH,
  );

  socket.on('error', (e) => {
    inject(InjectionToken.Logger).warn(`Could not connect to IPC hub with error: ${e}`);
  });

  socket.on('data', async (data) => {
    const userid = /^update (?<userid>.+)$/.exec(data.toString())?.groups.userid;
    if (!userid) {
      return;
    }
    await autoUpdateFromIPCHub(db, eventBus, bot.telegram, Number.parseInt(userid));
  });

  return socket.destroySoon;
};

export default connectToIPCHub;
