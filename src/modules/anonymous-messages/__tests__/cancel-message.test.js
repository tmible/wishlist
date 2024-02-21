import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('anonymous-messages/cancel-message module', () => {
  let cancelActionHandler;
  let CancelMessageModule;

  beforeEach(async () => {
    cancelActionHandler = await resolveModule('@tmible/wishlist-bot/helpers/cancel-action-handler')
      .then((path) => replaceEsm(path))
      .then((module) => module.default);
    CancelMessageModule = await import('../cancel-message.js').then((module) => module.default);
  });

  afterEach(reset);

  it('should register cancel_message action handler', () => {
    const bot = object([ 'action' ]);
    CancelMessageModule.configure(bot);
    verify(bot.action('cancel_message', matchers.isA(Function)));
  });

  describe('cancel_message action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelMessageModule.configure(bot);
      verify(bot.action('cancel_message', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx, matchers.isA(String), false));
    });
  });
});
