import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('editing/cancel-add module', () => {
  let cancelActionHandler;
  let CancelAddModule;

  beforeEach(async () => {
    cancelActionHandler = await resolveModule('@tmible/wishlist-bot/helpers/cancel-action-handler')
      .then((path) => replaceEsm(path))
      .then((module) => module.default);
    CancelAddModule = await import('../cancel-add.js').then((module) => module.default);
  });

  afterEach(reset);

  it('should register cancel_add action handler', () => {
    const bot = object([ 'action' ]);
    CancelAddModule.configure(bot);
    verify(bot.action('cancel_add', matchers.isA(Function)));
  });

  describe('cancel_add action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelAddModule.configure(bot);
      verify(bot.action('cancel_add', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx, matchers.isA(String), false));
    });
  });
});
