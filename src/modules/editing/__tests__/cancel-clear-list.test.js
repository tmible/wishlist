import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, object, replaceEsm, reset, verify } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('editing/cancel-clear-list module', () => {
  let cancelActionHandler;
  let CancelClearListModule;

  beforeEach(async () => {
    cancelActionHandler = await resolveModule('@tmible/wishlist-bot/helpers/cancel-action-handler')
      .then((path) => replaceEsm(path))
      .then((module) => module.default);
    CancelClearListModule = await import('../cancel-clear-list.js')
      .then((module) => module.default);
  });

  afterEach(reset);

  it('should register cancel_clear_list action handler', () => {
    const bot = object([ 'action' ]);
    CancelClearListModule.configure(bot);
    verify(bot.action('cancel_clear_list', matchers.isA(Function)));
  });

  describe('cancel_clear_list action handler', () => {
    it('should call cancelActionHandler', () => {
      const bot = object([ 'action' ]);
      const ctx = {};
      const captor = matchers.captor();
      CancelClearListModule.configure(bot);
      verify(bot.action('cancel_clear_list', captor.capture()));
      captor.value(ctx);
      verify(cancelActionHandler(ctx, matchers.isA(String), false));
    });
  });
});
