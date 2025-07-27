import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { getTdjson } from 'prebuilt-tdlib';
import tdl from 'tdl';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import botActionHandler from './bot-action-handler.js';
import { Client } from './injection-tokens.js';
import tdlibUpdateHandler from './tdlib-update-handler.js';

/** @typedef {import('telegraf').Telegraf} Telegraf */

/**
 * Настройка модуля управления группами Телеграм. Регистрация
 * обработчика для бота и запуск автоматизироанного клиента Телеграм
 * @function initGroupsFeature
 * @param {Telegraf} bot Бот
 * @returns {Promise<() => Promise<void>>} Функция остановки клиента
 * @async
 */
const initGroupsFeature = async (bot) => {
  const logger = inject(InjectionToken.Logger);
  logger.debug('configuring groups module (starting TDLib client)');

  bot.action(/^create_group (\d+) (\d+)$/, botActionHandler);

  tdl.configure({ tdjson: getTdjson() });

  const client = tdl.createClient({
    apiId: process.env.TELEGRAM_API_ID,
    apiHash: process.env.TELEGRAM_API_HASH,
    tdlibParameters: {
      use_message_database: false,
    },
  });

  client.on('error', (e) => logger.error(`TDLib client error: ${e}`));

  client.on('update', tdlibUpdateHandler);

  await client.login();

  provide(Client, client);
  logger.debug('TDLib client started');

  return async () => await client.close();
};

export default initGroupsFeature;
