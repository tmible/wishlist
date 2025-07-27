import { afterEach, beforeEach, describe, it } from 'node:test';
import { func, matchers, replaceEsm, reset, verify, when } from 'testdouble';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import { Client } from '../injection-tokens.js';

const bot = { action: func() };
const logger = { debug: func(), error: func() };
const client = { on: func(), login: func(), close: func() };

const [
  { inject, provide },
  { getTdjson },
  { configure, createClient },
  botActionHandler,
  tdlibUpdateHandler,
] = await Promise.all([
  replaceModule('@tmible/wishlist-common/dependency-injector'),
  replaceEsm('prebuilt-tdlib'),
  replaceEsm('tdl'),
  replaceEsm('../bot-action-handler.js').then((module) => module.default),
  replaceEsm('../tdlib-update-handler.js').then((module) => module.default),
]);
const initGroupsFeature = await import('../index.js').then((module) => module.default);

describe('groups / initialization', () => {
  beforeEach(() => {
    process.env.TELEGRAM_API_ID = 'TELEGRAM_API_ID';
    process.env.TELEGRAM_API_HASH = 'TELEGRAM_API_HASH';
    when(inject(InjectionToken.Logger)).thenReturn(logger);
    when(getTdjson()).thenReturn('tdjson');
    when(createClient(), { ignoreExtraArgs: true }).thenReturn(client);
  });

  afterEach(reset);

  it('should log initialization start', async () => {
    await initGroupsFeature(bot);
    verify(logger.debug('configuring groups module (starting TDLib client)'));
  });

  it('should register bot action handler', async () => {
    await initGroupsFeature(bot);
    verify(bot.action(/^create_group (\d+) (\d+)$/, botActionHandler));
  });

  it('should configure TDLib', async () => {
    await initGroupsFeature(bot);
    verify(configure({ tdjson: 'tdjson' }));
  });

  it('should create Telegram client', async () => {
    await initGroupsFeature(bot);
    verify(createClient({
      apiId: 'TELEGRAM_API_ID',
      apiHash: 'TELEGRAM_API_HASH',
      tdlibParameters: {
        use_message_database: false,
      },
    }));
  });

  it('should register Telegram client error handler', async () => {
    await initGroupsFeature(bot);
    verify(client.on('error', matchers.isA(Function)));
  });

  it('should log Telegram client errors', async () => {
    const captor = matchers.captor();
    await initGroupsFeature(bot);
    verify(client.on('error', captor.capture()));
    captor.value('test error');
    verify(logger.error('TDLib client error: test error'));
  });

  it('should register Telegram client update handler', async () => {
    await initGroupsFeature(bot);
    verify(client.on('update', tdlibUpdateHandler));
  });

  it('should login into Telegram client', async () => {
    await initGroupsFeature(bot);
    verify(client.login());
  });

  it('should provide Telegram client', async () => {
    await initGroupsFeature(bot);
    verify(provide(Client, client));
  });

  it('should log initialization end', async () => {
    await initGroupsFeature(bot);
    verify(logger.debug('TDLib client started'));
  });

  it('should return closing Telegram client function', async () => {
    const destroyGroupsFeature = await initGroupsFeature(bot);
    await destroyGroupsFeature();
    verify(client.close());
  });
});
