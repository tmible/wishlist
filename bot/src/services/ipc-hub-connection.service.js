import { connect } from 'node:net';
import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import { messageSupportFromIPCHub } from '@tmible/wishlist-bot/modules/support';
import { autoUpdateFromIPCHub } from '@tmible/wishlist-bot/services/lists-auto-update';

/** @typedef {import('telegraf').Telegraf} Telegraf */

/** @module Сервис подключения к IPC хабу */

const events = [{
  trigger: /^update (?<userid>\d+)$/,
  handler: async ({ groups }, bot) => {
    const db = inject(InjectionToken.LocalDatabase)('auto-update');
    const eventBus = inject(InjectionToken.EventBus);
    const logger = inject(InjectionToken.Logger);
    await autoUpdateFromIPCHub(db, eventBus, bot.telegram, logger, Number.parseInt(groups.userid));
  },
}, {
  trigger: /^(?<messageUUID>[\w-]{36}) support (?<userid>\d+) (?<message>.+)$/,
  handler: async ({ groups }, bot) => {
    const db = inject(InjectionToken.LocalDatabase)('hub-message-data');
    await db.put(groups.messageUUID, groups.message);
    let status;
    try {
      await messageSupportFromIPCHub(
        { telegram: bot.telegram },
        groups.userid,
        await db.get(groups.messageUUID),
        groups.messageUUID,
      );
      status = 'success';
    } catch (e) {
      console.log(e);
      status = 'fail';
    } finally {
      await db.del(groups.messageUUID);
      return `${groups.messageUUID} support ${status}`;
    }
  },
}];

/**
 * Подключения к IPC хабу и вызова автоматического обновления списков
 * при получении соответсвующего сообщения от хаба
 * @function connectToIPCHub
 * @param {Telegraf} bot Бот
 * @returns {void}
 */
const connectToIPCHub = (bot) => {
  const socket = connect(
    process.env.HUB_SOCKET_PATH,
  );

  socket.on('error', (e) => {
    inject(InjectionToken.Logger).warn(`Could not connect to IPC hub with error: ${e}`);
  });

  socket.on('data', async (data) => {
    for (const { trigger, handler } of events) {
      const match = trigger.exec(data.toString());
      if (match) {
        const reply = await handler(match, bot);
        if (reply) {
          socket.write(reply);
        }
      }
    }
  });

  provide(InjectionToken.IPCHub, { isConnected: () => socket.readyState === 'open' });

  return () => {
    if (socket.readyState === 'closed') {
      return;
    }
    socket.destroySoon();
  };
};

export default connectToIPCHub;
