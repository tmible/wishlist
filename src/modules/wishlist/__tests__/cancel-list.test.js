import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('wishlist/cancel-list module', () => {
  let cancelActionHandler;
  let CancelListModule;

  beforeEach(async () => {
    cancelActionHandler = await resolveModule('@tmible/wishlist-bot/helpers/cancel-action-handler')
      .then((path) => replaceEsm(path))
      .then((module) => module.default);
    CancelListModule = await import('../cancel-list.js').then((module) => module.default);
  });

  afterEach(reset);

  it('should register cancel_list action handler', () => {
    const bot = object([ 'action' ]);
    CancelListModule.configure(bot);
    verify(bot.action('cancel_list', matchers.isA(Function)));
  });

  describe('cancel_list action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelListModule.configure(bot);
      verify(bot.action('cancel_list', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx, matchers.isA(String), false));
    });
  });
});
