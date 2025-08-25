import { afterEach, beforeEach, describe, it } from 'node:test';
import { func, matchers, replaceEsm, reset, verify, when } from 'testdouble';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import { Client } from '../injection-tokens.js';

const bot = { action: func(), on: func() };
const logger = { debug: func(), error: func() };
const client = { on: func(), login: func(), close: func() };

const [
  { inject, provide },
  { getTdjson },
  { configure, createClient },
  cancelActionHandler,
  bindGroupActionHandler,
  bindGroupMessageHandler,
  createGroupActionHandler,
  tdlibUpdateHandler,
] = await Promise.all([
  replaceModule('@tmible/wishlist-common/dependency-injector'),
  replaceEsm('prebuilt-tdlib'),
  replaceEsm('tdl'),
  replaceEsm('@tmible/wishlist-bot/helpers/cancel-action-handler').then((module) => module.default),
  replaceEsm('../bind-group-action-handler.js').then((module) => module.default),
  replaceEsm('../bind-group-message-handler.js').then((module) => module.default),
  replaceEsm('../create-group-action-handler.js').then((module) => module.default),
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

  it('should register bot create_group action handler', async () => {
    await initGroupsFeature(bot);
    verify(bot.action(/^create_group (\d+) (\d+)$/, createGroupActionHandler));
  });

  it('should register bot bind_group action handler', async () => {
    await initGroupsFeature(bot);
    verify(bot.action(/^bind_group (\d+) (\d+)$/, bindGroupActionHandler));
  });

  it('should register bot bind_group message handler', async () => {
    await initGroupsFeature(bot);
    verify(bot.on('message', bindGroupMessageHandler));
  });

  it('should register bot cancel_bind_group action handler', async () => {
    await initGroupsFeature(bot);
    verify(bot.action('cancel_bind_group', matchers.isA(Function)));
  });

  describe('cancel_bind_group action handler', () => {
    it('should call cancelActionHandler', async () => {
      const ctx = {};
      const captor = matchers.captor();
      await initGroupsFeature(bot);
      verify(bot.action('cancel_bind_group', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx));
    });
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

  it('should return closing Telegram client function', async () => {
    const destroyGroupsFeature = await initGroupsFeature(bot);
    await destroyGroupsFeature();
    verify(client.close());
  });
});
